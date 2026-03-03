import React, { useState, useEffect } from 'react';
import { getDrillingOptions, recommendDrilling } from '../api';
import { Loader2, Hammer, AlertCircle, CheckCircle } from 'lucide-react';

const DrillingTechnique = () => {
    const [options, setOptions] = useState({ lithology_inputs: [], soil_texture: [], drilling_methods: [] });
    const [formData, setFormData] = useState({
        lithology: '',
        soil_texture: '',
        depth_to_water_m: '',
        distance_to_lineament_m: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchingOptions, setFetchingOptions] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDrillingOptions()
            .then(res => {
                setOptions(res);
                if (res.lithology_inputs?.length > 0) {
                    setFormData(prev => ({ ...prev, lithology: res.lithology_inputs[0], soil_texture: res.soil_texture[0] }));
                }
            })
            .catch(() => setError("Failed to fetch available options from the backend."))
            .finally(() => setFetchingOptions(false));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = {
                ...formData,
                depth_to_water_m: parseFloat(formData.depth_to_water_m),
                distance_to_lineament_m: parseFloat(formData.distance_to_lineament_m),
            };
            const res = await recommendDrilling(data);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <Hammer size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Drilling Technique</h1>
                    <p className="text-slate-500">Get recommendations for drilling methods tailored to the local geology.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    {fetchingOptions ? (
                        <div className="flex justify-center items-center h-40 text-slate-400">
                            <Loader2 className="animate-spin text-orange-500 mr-2" /> Loading options...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lithology / Rock Type</label>
                                <select
                                    name="lithology" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none capitalize"
                                    value={formData.lithology} onChange={handleChange}
                                >
                                    {options.lithology_inputs.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Soil Texture</label>
                                <select
                                    name="soil_texture" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    value={formData.soil_texture} onChange={handleChange}
                                >
                                    {options.soil_texture.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Depth to Water (m)</label>
                                <input
                                    type="number" step="any" required name="depth_to_water_m"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    value={formData.depth_to_water_m} onChange={handleChange}
                                    placeholder="e.g. 80"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Distance to Lineament (m)</label>
                                <input
                                    type="number" step="any" required name="distance_to_lineament_m"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                    value={formData.distance_to_lineament_m} onChange={handleChange}
                                    placeholder="e.g. 150"
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-70"
                            >
                                {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Evaluating...</> : 'Get Recommendation'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Results Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-h-[300px]">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mb-4">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error.toString()}</p>
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="text-center text-slate-400">
                            <Hammer size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Provide geological parameters to determine<br />the optimal drilling method.</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Recommended Method</h2>

                            <div className="flex items-center gap-4 bg-orange-50 p-5 rounded-xl border border-orange-100">
                                <div className="p-3 bg-orange-500 text-white rounded-lg shadow-sm">
                                    <Hammer size={32} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-orange-600/80 mb-0.5">Primary Technique</div>
                                    <div className="text-2xl font-bold text-slate-900">{result.recommended_drilling_method}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Model Factors Considered</h3>
                                <ul className="space-y-2">
                                    {result.explanation.map((item, idx) => (
                                        <li key={idx} className="flex gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrillingTechnique;
