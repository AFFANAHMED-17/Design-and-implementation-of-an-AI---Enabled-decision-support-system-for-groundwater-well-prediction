import joblib
enc_suitability = joblib.load("encoders/model_v1_encoders.pkl")
print("Lithology Type Classes:", enc_suitability["lithology_type"].classes_)
print("Aquifer Type Classes:", enc_suitability["aquifer_type"].classes_)
print("Soil Texture Classes:", enc_suitability["soil_texture"].classes_)
