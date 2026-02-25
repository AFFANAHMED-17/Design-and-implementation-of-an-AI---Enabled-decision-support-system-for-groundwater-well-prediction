AI-Enabled Groundwater Decision Support System

FastAPI Backend

A production-style FastAPI backend that integrates GIS data and machine-learning models to support groundwater planning and borewell decision-making.

The system exposes five independent ML services through REST APIs, each documented via Swagger.

Key Features

Borewell suitability assessment (GIS + ML)

Water-bearing zone depth prediction

Borewell discharge (yield) estimation

Drilling technique recommendation

Groundwater quality classification

Interactive API documentation (/docs)

Tech Stack

Backend: FastAPI (Python)

ML: Scikit-learn (Random Forest)

GIS: GeoPandas, Rasterio, Shapely

Data: Shapefile, GeoJSON, GeoTIFF, CSV

Serialization: Joblib

Project Structure
backend/
├── app.py
├── models/
├── encoders/
├── data/
│   ├── lithology/
│   ├── aquifer/
│   ├── districts/
│   ├── soil/
│   └── rainfall/
└── README.md
Setup & Run
1. Create Virtual Environment
python -m venv venv
source venv/bin/activate    # Linux / macOS
venv\Scripts\activate       # Windows
2. Install Dependencies
pip install fastapi uvicorn geopandas rasterio shapely pandas numpy scikit-learn joblib
3. Start Server
uvicorn app:app --reload
4. Open API Docs
http://127.0.0.1:8000/docs
API Endpoints
Service	Endpoint
Borewell Suitability	/model-1/borewell-suitability
Water Bearing Zone Depth	/model-2/water-bearing-depth
Borewell Discharge	/model-3/borewell-discharge
Drilling Technique	/model-4/drilling-technique
Groundwater Quality	/model-5/groundwater-quality
Example Requests
Borewell Suitability
{
  "latitude": 9.9252,
  "longitude": 78.1198
}
Water Bearing Zone Depth
{
  "aquifer_thickness_m": 45,
  "elevation_m": 120
}
Borewell Discharge
{
  "drilling_depth_m": 120,
  "bedrock_depth_m": 90,
  "static_water_level_m": 15,
  "drawdown_m": 8,
  "specific_capacity_lpm_per_m": 40,
  "transmissivity_m2_day": 150,
  "annual_rainfall_mm": 650,
  "distance_to_lineament_km": 0.03,
  "lineament_factor": 0.97,
  "lithology": "Granite"
}
Drilling Technique
{
  "lithology": "Granite",
  "soil_texture": "Fine",
  "depth_to_water_m": 12.5,
  "distance_to_lineament_m": 900
}
Groundwater Quality
{
  "pH": 7.6,
  "EC": 1200,
  "TDS": 450,
  "Cl": 90,
  "SO4": 180,
  "NO3": 25,
  "F": 1.2,
  "TH": 220,
  "Lithology_Group": "Charnockite_Granulite",
  "Soil_Texture_Group": "Medium"
}
Data Requirements

Lithology (Shapefile)

Aquifer boundaries (GeoJSON)

District boundaries (GeoJSON)

Soil texture raster (GeoTIFF)

District-wise rainfall (CSV)

All datasets must use WGS-84 (EPSG:4326).

Notes

Models are loaded once at startup for performance.

GIS layers are queried dynamically using spatial joins.

Predictions are region-specific and data-dependent.








model 1- 
need to connect gis to get the lithology_type , aquifer_type,soil_texture , pre_wl , post_wl , seasonal_fluctuation,annual_rainfall


model 3-
00  ->  Biotite Gneiss
01  ->  Biotite Gneiss and Charnockite
02  ->  Biotite Granite Gneiss
03  ->  Biotite and Garnetiferrous Sillimanite Gneiss
04  ->  Charnockite
05  ->  Charnockite & Granite Gneiss
06  ->  Charnockite Biotite Gneiss
07  ->  Charnockite with Intrusive Pink Granite
08  ->  Clay, Shale Sandstone Granite
09  ->  Crystalline Limestone, Biotite Gneiss & Calc Granulite
10  ->  Epidote Hornblende Gneiss
11  ->  Feldspathic Gneiss
12  ->  Fractured Biotite Gneiss
13  ->  Fractured Biotite Gneiss with Pegmatites
14  ->  Fractured Biotite Gneiss withpegmatite and Quartz Veins
15  ->  Fractured Charnockite
16  ->  Gneiss
17  ->  Gneiss & Granite
18  ->  Gneiss Charnockite
19  ->  Granite
20  ->  Granite Biotite Gneiss
21  ->  Granite Gneiss
22  ->  Granite Gneiss & Charnockite
23  ->  Granite Gneiss & Pink Granite
24  ->  Granite Gneiss Rich In Biotite
25  ->  Granite Gneiss and Biotite Gneiss
26  ->  Granite Gneiss and Charnockite
27  ->  Granite Gneiss and Pink Granite
28  ->  Granite, Granite Gneiss
29  ->  Hornblende Biotite Gneiss
30  ->  Hornblende Gneiss
31  ->  Khondalite
32  ->  Pink Granite and Biotite Gneiss
33  ->  Quartize Charnockite
34  ->  Sand and Clay Followed By Fractured Biotite Gneiss
35  ->  Sand and Clay and Weathered Granite
36  ->  Sand and Clay with Gravel Followed By Fractured Biotite Gneiss
37  ->  Sand and Clay with Limestone Garnetiferrous Gneiss
38  ->  Sand and Clay, Sandstone, Calcareous Material, Gneiss
39  ->  Sand and Clay, Weathered Granite Gneiss
40  ->  Sand with Clay and Granite Gneiss
41  ->  Sand with Clay, Argillaceous Sandstone, Calcareous Material, Garnetiferrous Gneiss
42  ->  Sand with Clay, Sandstone, Granite
43  ->  Sand with Kankar Followed By Fractured Biotite Gneiss and Calc Granulite
44  ->  Sand with Kankar, Granite Gneiss
45  ->  Sand, Clay and Tertiary Sandstone Hornblende Gneiss
46  ->  Sand, Clay with Gravel Followed By Fractured Biotite Gneiss
47  ->  Sand, Clay with Gravel Followed By Fractured Biotite Gneiss and Pegmatite
48  ->  Sandstone with Clay & Charnockite
49  ->  Syenite