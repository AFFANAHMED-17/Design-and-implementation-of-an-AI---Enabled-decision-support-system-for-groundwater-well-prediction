import geopandas as gpd
import pandas as pd

print("--- Litholog ---")
gdf_lith = gpd.read_file("data/Litholog.geojson")
print(gdf_lith.columns)
print(gdf_lith.head(2))

print("\n--- Major Aquifers ---")
gdf_aq = gpd.read_file("data/Major Aquifers.geojson")
print(gdf_aq.columns)
print(gdf_aq.head(2))

print("\n--- Water DS CSV ---")
df_water = pd.read_csv("data/water_ds.csv")
print(df_water.columns)
print(df_water.head(2))
