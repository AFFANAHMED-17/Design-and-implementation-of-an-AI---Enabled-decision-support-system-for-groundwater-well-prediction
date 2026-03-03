import React, { useState } from 'react';
import { predictQuality } from '../api';
import { Loader2, TestTube, AlertCircle, Droplet, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

const lithologyGroups = ['Hard Rock', 'Sedimentary', 'Alluvial'];
const soilTextureGroups = ['Fine', 'Medium', 'Coarse'];

const GroundwaterQuality = () => {
    const [formData, setFormData] = useState({
        pH: '', EC: '', TDS: '', Cl: '', SO4: '', NO3: '', F: '', TH: '',
        Lithology_Group: 'Hard Rock',
        Soil_Texture_Group: 'Fine'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = {
                ...formData,
                pH: parseFloat(formData.pH),
                EC: parseFloat(formData.EC),
                TDS: parseFloat(formData.TDS),
                Cl: parseFloat(formData.Cl),
                SO4: parseFloat(formData.SO4),
                NO3: parseFloat(formData.NO3),
                F: parseFloat(formData.F),
                TH: parseFloat(formData.TH),
            };
            const res = await predictQuality(data);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred fetching predictions.");
        } finally {
            setLoading(false);
        }
    };

    const QualityIcon = () => {
        if (!result) return null;
        if (result.groundwater_quality === 'Good') return <ShieldCheck size={48} className="text-green-500 mx-auto" />;
        if (result.groundwater_quality === 'Moderate') return <AlertTriangle size={48} className="text-amber-500 mx-auto" />;
        return <ShieldAlert size={48} className="text-red-500 mx-auto" />;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <TestTube size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Groundwater Quality</h1>
                    <p className="text-slate-500">Assess water quality and usage safety based on chemical constituents.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                            {[
                                { label: 'pH Value', name: 'pH', placeholder: 'e.g. 7.2' },
                                { label: 'Electrical Conductivity (EC)', name: 'EC', placeholder: 'µS/cm' },
                                { label: 'Total Dissolved Solids (TDS)', name: 'TDS', placeholder: 'mg/L' },
                                { label: 'Chloride (Cl)', name: 'Cl', placeholder: 'mg/L' },
                                { label: 'Sulphate (SO4)', name: 'SO4', placeholder: 'mg/L' },
                                { label: 'Nitrate (NO3)', name: 'NO3', placeholder: 'mg/L' },
                                { label: 'Fluoride (F)', name: 'F', placeholder: 'mg/L' },
                                { label: 'Total Hardness (TH)', name: 'TH', placeholder: 'mg/L' },
                            ].map(field => (
                                <div key={field.name} className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                                    <input
                                        type="number" step="any" required name={field.name} placeholder={field.placeholder}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        value={formData[field.name]} onChange={handleChange}
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lithology Group</label>
                                <select
                                    name="Lithology_Group" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    value={formData.Lithology_Group} onChange={handleChange}
                                >
                                    {lithologyGroups.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Soil Texture Group</label>
                                <select
                                    name="Soil_Texture_Group" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    value={formData.Soil_Texture_Group} onChange={handleChange}
                                >
                                    {soilTextureGroups.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-70"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Classifying...</> : 'Analyze Quality'}
                        </button>
                    </form>
                </div>

                {/* Results Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col pt-10">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mb-4">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{error.toString()}</p>
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="text-center text-slate-400 my-auto">
                            <TestTube size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Provide chemical testing parameters to evaluate water safety.</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center text-center">

                            <div className="mb-4">
                                <QualityIcon />
                                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-1">{result.groundwater_quality} Quality</h2>
                                <p className="text-slate-500 text-sm">Classification Result</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <Droplet className="text-purple-500 mx-auto mb-2 opacity-50" size={24} />
                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest block mb-2">Usage Advice</span>
                                <div className="font-medium text-slate-800 leading-snug">
                                    {result.usage_recommendation}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroundwaterQuality;
