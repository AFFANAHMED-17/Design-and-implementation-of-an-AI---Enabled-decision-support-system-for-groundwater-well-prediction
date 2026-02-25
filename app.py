# ==========================================================
# IMPORTS
# ==========================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import Optional
import numpy as np
import pandas as pd
import joblib
import os
from pathlib import Path

# ==========================================================
# PATH SETUP
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI(
    title="AI-Enabled Groundwater Decision Support System",
    description="""
Machine-learning based groundwater decision system providing:
• Borewell suitability
• Water-bearing zone depth
• Borewell discharge
• Drilling technique recommendation
• Groundwater quality classification
""",
    version="1.0.0"
)

# ==========================================================
# HELPER FUNCTIONS
# ==========================================================

def normalize_category(value: str) -> str:
    return value.strip().upper().replace(" ", "_")


def safe_encode(value: str, encoder, field_name: str) -> int:
    value = normalize_category(value)
    if value not in encoder.classes_:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}. Allowed values: {list(encoder.classes_)}"
        )
    return int(encoder.transform([value])[0])

# ==========================================================
# MODEL LOADING (ONCE)
# ==========================================================

# Model 1
model_suitability = joblib.load(
    os.path.join(BASE_DIR, "models", "model_v1_suitability.pkl")
)
enc_suitability = joblib.load(
    os.path.join(BASE_DIR, "encoders", "model_v1_encoders.pkl")
)

# Model 2
model_depth = joblib.load(
    os.path.join(BASE_DIR, "models", "model_2_depth_predictor.pkl")
)

# Model 3
model_discharge = joblib.load(
    os.path.join(BASE_DIR, "models", "model_3_discharge_predictor.pkl")
)
enc_lithology = joblib.load(
    os.path.join(BASE_DIR, "encoders", "model_3_lithology_encoder.pkl")
)

# Model 4
model_drilling = joblib.load(
    os.path.join(BASE_DIR, "models", "model_4_drilling_technique.pkl")
)
enc_drilling = joblib.load(
    os.path.join(BASE_DIR, "encoders", "model_4_encoders.pkl")
)

# ==========================================================
# MODEL 1 – BOREWELL SUITABILITY
# ==========================================================

class SuitabilityRequest(BaseModel):
    latitude: float
    longitude: float


class SuitabilityResponse(BaseModel):
    suitability_class: str
    confidence_percent: float


@app.post("/model-1/borewell-suitability", response_model=SuitabilityResponse)
def predict_suitability(_: SuitabilityRequest):

    X = pd.DataFrame([{
        "lithology_type": enc_suitability["lithology_type"].transform(
            [enc_suitability["lithology_type"].classes_[0]]
        )[0],
        "aquifer_type": enc_suitability["aquifer_type"].transform(
            [enc_suitability["aquifer_type"].classes_[0]]
        )[0],
        "soil_texture": enc_suitability["soil_texture"].transform(
            [enc_suitability["soil_texture"].classes_[0]]
        )[0],
        "pre_wl": 15.0,
        "post_wl": 10.0,
        "seasonal_fluctuation": 5.0,
        "annual_rainfall": 650.0
    }])

    probs = model_suitability.predict_proba(X)[0]
    pred = model_suitability.predict(X)[0]

    confidence = round(
        (sorted(probs, reverse=True)[0] - sorted(probs, reverse=True)[1]) * 100,
        2
    )

    return {
        "suitability_class": pred,
        "confidence_percent": confidence
    }

# ==========================================================
# MODEL 2 – WATER BEARING ZONE DEPTH
# ==========================================================

class DepthRequest(BaseModel):
    aquifer_thickness_m: float
    elevation_m: float


class DepthResponse(BaseModel):
    predicted_depth_m: float
    min_depth_m: float
    max_depth_m: float
    confidence_level: str


@app.post("/model-2/water-bearing-depth", response_model=DepthResponse)
def predict_depth(data: DepthRequest):

    X = np.array([[data.aquifer_thickness_m, data.elevation_m]])
    depth = float(model_depth.predict(X)[0])

    return {
        "predicted_depth_m": round(depth, 2),
        "min_depth_m": round(max(0, depth - 49.65), 2),
        "max_depth_m": round(depth + 49.65, 2),
        "confidence_level": "Medium"
    }

# ==========================================================
# MODEL 3 – BOREWELL DISCHARGE
# ==========================================================

class Lithology(str, Enum):
    BIOTITE_GNEISS = "Biotite Gneiss"
    BIOTITE_GNEISS_AND_CHARNOCKITE = "Biotite Gneiss and Charnockite"
    BIOTITE_GRANITE_GNEISS = "Biotite Granite Gneiss"
    CHARNOCKITE = "Charnockite"
    GRANITE = "Granite"
    GRANITE_GNEISS = "Granite Gneiss"
    SYENITE = "Syenite"


class DischargeRequest(BaseModel):
    drilling_depth_m: float
    bedrock_depth_m: float
    static_water_level_m: float
    drawdown_m: float
    specific_capacity_lpm_per_m: float
    transmissivity_m2_day: float
    annual_rainfall_mm: float
    distance_to_lineament_m: Optional[float] = None
    distance_to_lineament_km: Optional[float] = None
    lineament_factor: float
    lithology: Lithology


class DischargeResponse(BaseModel):
    predicted_discharge_lpm: float
    yield_category: str


def encode_lithology(lithology: str) -> int:
    lithology = lithology.strip()
    if lithology not in enc_lithology.classes_:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid lithology",
                "allowed_lithologies": enc_lithology.classes_.tolist()
            }
        )
    return int(enc_lithology.transform([lithology])[0])


@app.post("/model-3/borewell-discharge", response_model=DischargeResponse)
def predict_discharge(data: DischargeRequest):

    if data.distance_to_lineament_m is not None:
        distance_m = data.distance_to_lineament_m
    elif data.distance_to_lineament_km is not None:
        distance_m = data.distance_to_lineament_km * 1000
    else:
        raise HTTPException(
            status_code=400,
            detail="Either distance_to_lineament_m or distance_to_lineament_km must be provided"
        )

    lith_code = encode_lithology(data.lithology.value)

    X = np.array([[
        data.drilling_depth_m,
        data.bedrock_depth_m,
        data.static_water_level_m,
        data.drawdown_m,
        data.specific_capacity_lpm_per_m,
        data.transmissivity_m2_day,
        data.annual_rainfall_mm,
        distance_m,
        data.lineament_factor,
        lith_code
    ]])

    pred_log = model_discharge.predict(X)[0]
    discharge = float(np.expm1(pred_log))
    discharge = max(10, min(discharge, 3000))

    category = (
        "Low" if discharge < 100 else
        "Moderate" if discharge < 300 else
        "High"
    )

    return {
        "predicted_discharge_lpm": round(discharge, 2),
        "yield_category": category
    }

# ==========================================================
# MODEL 4 – DRILLING TECHNIQUE
# ==========================================================

LITHOLOGY_MAP = {
    "granite": "Granite Gneiss",
    "gneiss": "Gneiss",
    "basalt": "Basalt",
    "charnockite": "Charnockite",
    "alluvium": "Alluvium",
    "sandstone": "Sandstone",
    "limestone": "Limestone",
    "laterite": "Laterite"
}

SOIL_TEXTURE_ALLOWED = ["Fine", "Medium", "Coarse"]


class DrillingRequest(BaseModel):
    lithology: str
    soil_texture: str
    depth_to_water_m: float
    distance_to_lineament_m: float


class DrillingResponse(BaseModel):
    recommended_drilling_method: str
    explanation: list


@app.get("/model-4/allowed-values")
def model4_allowed_values():
    return {
        "lithology_inputs": list(LITHOLOGY_MAP.keys()),
        "soil_texture": SOIL_TEXTURE_ALLOWED,
        "drilling_methods": ["DTH", "Rotary", "Percussion", "Combination"]
    }


@app.post("/model-4/drilling-technique", response_model=DrillingResponse)
def recommend_drilling(data: DrillingRequest):

    lith_key = data.lithology.strip().lower()
    if lith_key not in LITHOLOGY_MAP:
        raise HTTPException(
            status_code=400,
            detail={"error": "Unsupported lithology", "allowed": list(LITHOLOGY_MAP.keys())}
        )

    if data.soil_texture not in SOIL_TEXTURE_ALLOWED:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid soil texture", "allowed": SOIL_TEXTURE_ALLOWED}
        )

    X = np.array([[
        enc_drilling["lithology"].transform([LITHOLOGY_MAP[lith_key]])[0],
        enc_drilling["soil_texture"].transform([data.soil_texture])[0],
        data.depth_to_water_m,
        data.distance_to_lineament_m
    ]])

    technique = model_drilling.predict(X)[0]

    return {
        "recommended_drilling_method": technique,
        "explanation": [
            f"Normalized lithology: {LITHOLOGY_MAP[lith_key]}",
            f"Soil texture: {data.soil_texture}",
            f"Depth to water-bearing zone: {data.depth_to_water_m} m",
            "Structural control considered using lineament proximity"
        ]
    }

# ==========================================================
# MODEL 5 – GROUNDWATER QUALITY (CORRECT PATHS – LAST)
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "model5_groundwater_quality_model.pkl"
FEATURES_PATH = BASE_DIR / "encoders" / "model5_encoder_features.pkl"

model = joblib.load(MODEL_PATH)
model_features = joblib.load(FEATURES_PATH)


class WaterQualityRequest(BaseModel):
    pH: float
    EC: float
    TDS: float
    Cl: float
    SO4: float
    NO3: float
    F: float
    TH: float
    Lithology_Group: str
    Soil_Texture_Group: str


class WaterQualityResponse(BaseModel):
    groundwater_quality: str
    usage_recommendation: str


@app.post("/predict/groundwater-quality", response_model=WaterQualityResponse)
def predict_quality(data: WaterQualityRequest):

    df = pd.DataFrame([data.dict()])
    df_encoded = pd.get_dummies(
        df,
        columns=["Lithology_Group", "Soil_Texture_Group"],
        drop_first=True
    )

    df_encoded = df_encoded.reindex(columns=model_features, fill_value=0)
    prediction = model.predict(df_encoded)[0]

    usage = (
        "Suitable for drinking and irrigation" if prediction == "Good"
        else "Drinking requires treatment" if prediction == "Moderate"
        else "Not suitable for drinking"
    )

    return {
        "groundwater_quality": prediction,
        "usage_recommendation": usage
    }

# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health():
    return {"status": "API running successfully"}