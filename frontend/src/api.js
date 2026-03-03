import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export const checkHealth = async () => {
    const response = await api.get("/health");
    return response.data;
};

export const predictSuitability = async (data) => {
    const response = await api.post("/model-1/borewell-suitability", data);
    return response.data;
};

export const predictDepth = async (data) => {
    const response = await api.post("/model-2/water-bearing-depth", data);
    return response.data;
};

export const predictDischarge = async (data) => {
    const response = await api.post("/model-3/borewell-discharge", data);
    return response.data;
};

export const getDrillingOptions = async () => {
    const response = await api.get("/model-4/allowed-values");
    return response.data;
};

export const recommendDrilling = async (data) => {
    const response = await api.post("/model-4/drilling-technique", data);
    return response.data;
};

export const predictQuality = async (data) => {
    const response = await api.post("/predict/groundwater-quality", data);
    return response.data;
};

export default api;
