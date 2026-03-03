import geopandas as gpd
import pandas as pd
import json

out = {}

df_wl = pd.read_csv("data/gwl_manual_quarterly_tamil-nadu-sw-gw_tn_1991_2020.csv", nrows=2)
out["wl_columns"] = list(df_wl.columns)

df_rf = pd.read_csv("data/rainfall_occurred_during_whole_year_tn_2018_19.csv", nrows=2)
out["rf_columns"] = list(df_rf.columns)

gdf_lith = gpd.read_file("data/Litholog.geojson", rows=2)
out["litholog_geom_type"] = str(gdf_lith.geom_type.iloc[0])

gdf_aq = gpd.read_file("data/Major Aquifers.geojson", rows=2)
out["aquifers_geom_type"] = str(gdf_aq.geom_type.iloc[0])

with open("schema_out2.json", "w") as f:
    json.dump(out, f, indent=4)
