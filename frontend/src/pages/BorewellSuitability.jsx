import React, { useState } from 'react';
import { predictSuitability } from '../api';
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

const BorewellSuitability = () => {
    const [formData, setFormData] = useState({ latitude: '', longitude: '' });
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
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };
            const res = await predictSuitability(data);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred while fetching predictions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <MapPin size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Borewell Suitability</h1>
                    <p className="text-slate-500">Predict the groundwater potential based on geographic coordinates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Location Input</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                placeholder="e.g. 11.1271"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                placeholder="e.g. 78.6569"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-70"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</> : 'Analyze Location'}
                        </button>
                    </form>
                </div>

                {/* Results Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center min-h-[300px]">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error.toString()}</p>
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="text-center text-slate-400">
                            <MapPin size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Enter coordinates and run analysis<br />to see suitability results.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center text-slate-400">
                            <Loader2 size={40} className="mx-auto mb-3 animate-spin text-blue-500" />
                            <p className="animate-pulse">Analyzing GIS & Climate Data...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300">
                            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Analysis Result</h2>

                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3 mb-1">
                                    <CheckCircle2 className={result.suitability_class.toLowerCase().includes('good') ? 'text-green-500' : 'text-amber-500'} size={24} />
                                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Suitability Class</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 ml-9">
                                    {result.suitability_class}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Confidence Score</span>
                                    <span className="text-sm font-bold text-blue-600">{result.confidence_percent}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${result.confidence_percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BorewellSuitability;
