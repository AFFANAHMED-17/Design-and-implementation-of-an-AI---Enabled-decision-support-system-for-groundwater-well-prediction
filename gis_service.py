import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
import warnings
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

print("Loading GIS Datasets... (this may take up to 15 seconds)")
try:
    gdf_lith = gpd.read_file(os.path.join(DATA_DIR, "Litholog.geojson"))
except Exception as e:
    print("Warning: Could not load Litholog.geojson:", e)
    gdf_lith = gpd.GeoDataFrame()

try:
    gdf_aq = gpd.read_file(os.path.join(DATA_DIR, "Major Aquifers.geojson"))
except Exception as e:
    print("Warning: Could not load Major Aquifers.geojson:", e)
    gdf_aq = gpd.GeoDataFrame()

try:
    df_wl = pd.read_csv(os.path.join(DATA_DIR, "gwl_manual_quarterly_tamil-nadu-sw-gw_tn_1991_2020.csv"), low_memory=False)
    # Convert lat/lon strings safely
    df_wl['Latitude'] = pd.to_numeric(df_wl['Latitude'], errors='coerce')
    df_wl['Longitude'] = pd.to_numeric(df_wl['Longitude'], errors='coerce')
    df_wl_clean = df_wl.dropna(subset=['Latitude', 'Longitude']).copy()
    gdf_wl = gpd.GeoDataFrame(df_wl_clean, geometry=gpd.points_from_xy(df_wl_clean.Longitude, df_wl_clean.Latitude), crs="EPSG:4326")
except Exception as e:
    print("Warning: Could not load WL CSV:", e)
    df_wl_clean = pd.DataFrame()
    gdf_wl = gpd.GeoDataFrame()

try:
    df_rf = pd.read_csv(os.path.join(DATA_DIR, "rainfall_occurred_during_whole_year_tn_2018_19.csv"))
except Exception as e:
    print("Warning: Could not load RF CSV:", e)
    df_rf = pd.DataFrame()

print("GIS Datasets Loaded Successfully.")

def map_lithology_type(lith_str):
    if not isinstance(lith_str, str): return 'Other_Hard_Rock'
    lith_str = lith_str.lower()
    if 'charnockite' in lith_str: return 'Charnockite'
    if 'granite' in lith_str or 'gneiss' in lith_str: return 'Granite_Gneiss'
    if 'laterite' in lith_str: return 'Laterite'
    if 'quartzite' in lith_str: return 'Quartzite'
    return 'Other_Hard_Rock'

def map_aquifer_type(aq_str):
    if not isinstance(aq_str, str): return 'Hard_Rock'
    aq_str = aq_str.lower()
    if 'alluvi' in aq_str or 'sand' in aq_str or 'clay' in aq_str: return 'Alluvial'
    if 'laterit' in aq_str: return 'Lateritic'
    return 'Hard_Rock'

def get_gis_features(latitude: float, longitude: float):
    # If out of bounds of typical coordinates for testing
    if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
        return None 

    point = Point(longitude, latitude)
    point_gdf = gpd.GeoDataFrame([{'geometry': point}], crs="EPSG:4326")

    # 1. Lithology
    lith_val = 'Other_Hard_Rock'
    if not gdf_lith.empty:
        if gdf_lith.geom_type.iloc[0] == 'Point':
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                nearest_lith = gpd.sjoin_nearest(point_gdf, gdf_lith, how="left")
            if not nearest_lith.empty and 'Major_Lithology' in nearest_lith.columns:
                lith_val = map_lithology_type(nearest_lith['Major_Lithology'].iloc[0])
        else:
            intersect = gpd.sjoin(point_gdf, gdf_lith, how="left", predicate="intersects")
            if not intersect.empty and 'Major_Lithology' in intersect.columns and pd.notna(intersect['Major_Lithology'].iloc[0]):
                lith_val = map_lithology_type(intersect['Major_Lithology'].iloc[0])

    # 2. Aquifer
    aq_val = 'Hard_Rock'
    if not gdf_aq.empty:
        intersect_aq = gpd.sjoin(point_gdf, gdf_aq, how="left", predicate="intersects")
        col = 'aquifer' if 'aquifer' in intersect_aq.columns else ('aquifers' if 'aquifers' in intersect_aq.columns else None)
        if col and not intersect_aq.empty and pd.notna(intersect_aq[col].iloc[0]):
            aq_val = map_aquifer_type(intersect_aq[col].iloc[0])

    # 3. Soil Texture
    soil_val = 'Loamy'
    if aq_val == 'Alluvial': soil_val = 'Clayey'
    if aq_val == 'Lateritic': soil_val = 'Sandy'
    if aq_val == 'Hard_Rock': soil_val = 'Rocky'

    # 4. Water Level & Fluctuation
    pre_wl = 10.0
    post_wl = 5.0
    fluctuation = 5.0
    district = None

    if not gdf_wl.empty:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            nearest_wl = gpd.sjoin_nearest(point_gdf, gdf_wl, how="left")
        
        if not nearest_wl.empty:
            if 'Station' in nearest_wl.columns:
                station = nearest_wl['Station'].iloc[0]
                station_data = df_wl_clean[df_wl_clean['Station'] == station]
            else:
                station_data = pd.DataFrame()

            if 'District' in nearest_wl.columns:
                district = nearest_wl['District'].iloc[0]

            if not station_data.empty:
                col_name = 'Groundwater Level Quarterly Manual (meter)'
                vals = pd.to_numeric(station_data[col_name], errors='coerce').dropna()
                if len(vals) > 0:
                    pre_wl = float(vals.max())
                    post_wl = float(vals.min())
                    fluctuation = max(pre_wl - post_wl, 0.1)

    # 5. Rainfall
    rainfall = 650.0
    if not df_rf.empty and district:
        rf_val = df_rf[df_rf['District'].str.lower() == str(district).lower()]
        if not rf_val.empty:
            rainfall = float(rf_val["Actual Rainfall occurred during June'18 to May'19 (in mm)"].iloc[0])

    return {
        "lithology_type": lith_val,
        "aquifer_type": aq_val,
        "soil_texture": soil_val,
        "pre_wl": pre_wl,
        "post_wl": post_wl,
        "seasonal_fluctuation": fluctuation,
        "annual_rainfall": rainfall
    }
