import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import time

print("Loading data...")
t0 = time.time()
gdf_lith = gpd.read_file("data/Litholog.geojson")
gdf_aq = gpd.read_file("data/Major Aquifers.geojson")
df_wl = pd.read_csv("data/gwl_manual_quarterly_tamil-nadu-sw-gw_tn_1991_2020.csv")
df_rf = pd.read_csv("data/rainfall_occurred_during_whole_year_tn_2018_19.csv")
print(f"Loaded in {time.time()-t0:.2f}s")

lat, lon = 11.1271, 78.6569
point = Point(lon, lat)
point_gdf = gpd.GeoDataFrame([{'geometry': point}], crs="EPSG:4326")

print("Lithology:")
if not gdf_lith.empty:
    if gdf_lith.geom_type.iloc[0] == 'Point':
        # Find nearest
        nearest_lith = gpd.sjoin_nearest(point_gdf, gdf_lith, how="left")
        print(nearest_lith[['Major_Lithology', 'Lithology_Code']].head(1))
    else:
        intersect = gpd.sjoin(point_gdf, gdf_lith, how="left", predicate="intersects")
        print(intersect[['Major_Lithology']].head(1))

print("Aquifer:")
intersect_aq = gpd.sjoin(point_gdf, gdf_aq, how="left", predicate="intersects")
if not intersect_aq.empty and 'aquifer' in intersect_aq.columns:
    print(intersect_aq[['aquifer', 'aquifers']].head(1))

print("Water Level (nearest):")
df_wl_clean = df_wl.dropna(subset=['Latitude', 'Longitude'])
gdf_wl = gpd.GeoDataFrame(df_wl_clean, geometry=gpd.points_from_xy(df_wl_clean.Longitude, df_wl_clean.Latitude), crs="EPSG:4326")
nearest_wl = gpd.sjoin_nearest(point_gdf, gdf_wl, how="left")
print(nearest_wl[['Groundwater Level Quarterly Manual (meter)', 'Data Acquisition Time']].head(5))

print("Rainfall:")
nearest_rf = gpd.sjoin_nearest(point_gdf, gdf_wl, how="left") # Wait, rainfall only has District, no lat/lon. Can join District boundary? Or use wl's district?
district = nearest_wl['District'].iloc[0] if not nearest_wl.empty else None
print(f"District from WL: {district}")
if district:
    rf_val = df_rf[df_rf['District'].str.lower() == str(district).lower()]
    print(rf_val[["District", "Actual Rainfall occurred during June'18 to May'19 (in mm)"]].head(1))
