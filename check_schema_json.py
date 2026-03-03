import geopandas as gpd
import pandas as pd
import json

out = {}

print("--- Litholog ---")
gdf_lith = gpd.read_file("data/Litholog.geojson", rows=2)
out["litholog_columns"] = list(gdf_lith.columns)

print("\n--- Major Aquifers ---")
gdf_aq = gpd.read_file("data/Major Aquifers.geojson", rows=2)
out["aquifers_columns"] = list(gdf_aq.columns)

print("\n--- Water DS CSV ---")
df_water = pd.read_csv("data/water_ds.csv", nrows=2)
out["water_ds_columns"] = list(df_water.columns)

with open("schema_out.json", "w") as f:
    json.dump(out, f, indent=4)
