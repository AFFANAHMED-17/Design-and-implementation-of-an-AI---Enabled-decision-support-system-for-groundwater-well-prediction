import React, { useState } from 'react';
import { predictDepth } from '../api';
import { Loader2, Waves, AlertCircle } from 'lucide-react';

const WaterBearingDepth = () => {
    const [formData, setFormData] = useState({ aquifer_thickness_m: '', elevation_m: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = {
                aquifer_thickness_m: parseFloat(formData.aquifer_thickness_m),
                elevation_m: parseFloat(formData.elevation_m)
            };
            const res = await predictDepth(data);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                    <Waves size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Water Bearing Zone Depth</h1>
                    <p className="text-slate-500">Estimate the depth of water-bearing fractures.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aquifer Thickness (m)</label>
                            <input
                                type="number" step="any" required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g. 15.5"
                                value={formData.aquifer_thickness_m}
                                onChange={(e) => setFormData({ ...formData, aquifer_thickness_m: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Elevation (m a.s.l)</label>
                            <input
                                type="number" step="any" required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g. 120"
                                value={formData.elevation_m}
                                onChange={(e) => setFormData({ ...formData, elevation_m: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors disabled:opacity-70"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Calculating...</> : 'Estimate Depth'}
                        </button>
                    </form>
                </div>

                {/* Results Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-h-[300px]">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error.toString()}</p>
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="text-center text-slate-400">
                            <Waves size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Provide aquifer dimensions<br />to see depth estimates.</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-4 animate-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Predicted Depth</h2>

                            <div className="text-center p-6 bg-teal-50 rounded-xl border border-teal-100">
                                <p className="text-sm text-teal-600 font-medium mb-1">Optimal Depth</p>
                                <div className="text-4xl font-extrabold text-teal-700">
                                    {result.predicted_depth_m} <span className="text-xl font-medium text-teal-600/70">m</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Min Depth</span>
                                    <div className="text-lg font-bold text-slate-800">{result.min_depth_m} m</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Max Depth</span>
                                    <div className="text-lg font-bold text-slate-800">{result.max_depth_m} m</div>
                                </div>
                            </div>

                            <div className="text-center text-sm font-medium text-slate-500 mt-2">
                                Confidence Level: <span className="text-slate-800">{result.confidence_level}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaterBearingDepth;
