import React, { useState } from 'react';
import { predictDischarge } from '../api';
import { Loader2, Droplet, AlertCircle } from 'lucide-react';

const lithologies = [
    "Biotite Gneiss",
    "Biotite Gneiss and Charnockite",
    "Biotite Granite Gneiss",
    "Charnockite",
    "Granite",
    "Granite Gneiss",
    "Syenite"
];

const BorewellDischarge = () => {
    const [formData, setFormData] = useState({
        drilling_depth_m: '',
        bedrock_depth_m: '',
        static_water_level_m: '',
        drawdown_m: '',
        specific_capacity_lpm_per_m: '',
        transmissivity_m2_day: '',
        annual_rainfall_mm: '',
        distance_to_lineament_m: '',
        lineament_factor: '',
        lithology: 'Biotite Gneiss'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = {
                ...formData,
                drilling_depth_m: parseFloat(formData.drilling_depth_m),
                bedrock_depth_m: parseFloat(formData.bedrock_depth_m),
                static_water_level_m: parseFloat(formData.static_water_level_m),
                drawdown_m: parseFloat(formData.drawdown_m),
                specific_capacity_lpm_per_m: parseFloat(formData.specific_capacity_lpm_per_m),
                transmissivity_m2_day: parseFloat(formData.transmissivity_m2_day),
                annual_rainfall_mm: parseFloat(formData.annual_rainfall_mm),
                distance_to_lineament_m: parseFloat(formData.distance_to_lineament_m),
                lineament_factor: parseFloat(formData.lineament_factor),
            };

            const res = await predictDischarge(data);
            setResult(res);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Droplet size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Borewell Discharge</h1>
                    <p className="text-slate-500">Calculate the expected yield category and predicted discharge rate.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {[
                                { label: 'Drilling Depth (m)', name: 'drilling_depth_m' },
                                { label: 'Bedrock Depth (m)', name: 'bedrock_depth_m' },
                                { label: 'Static Water Level (m)', name: 'static_water_level_m' },
                                { label: 'Drawdown (m)', name: 'drawdown_m' },
                                { label: 'Specific Capacity (LPM/m)', name: 'specific_capacity_lpm_per_m' },
                                { label: 'Transmissivity (m²/day)', name: 'transmissivity_m2_day' },
                                { label: 'Annual Rainfall (mm)', name: 'annual_rainfall_mm' },
                                { label: 'Distance to Lineament (m)', name: 'distance_to_lineament_m' },
                                { label: 'Lineament Factor (0-1)', name: 'lineament_factor', step: '0.01' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                                    <input
                                        type="number" step={field.step || "any"} required name={field.name}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        value={formData[field.name]} onChange={handleChange}
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lithology</label>
                                <select
                                    name="lithology" required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={formData.lithology} onChange={handleChange}
                                >
                                    {lithologies.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-70"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Processing...</> : 'Predict Discharge Yield'}
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
                            <Droplet size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Enter borehole and aquifer parameters to predict well yield.</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
                            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-2">Predicted Yield</h2>

                            <div className="text-center mb-6">
                                <div className="inline-block p-4 bg-indigo-50 rounded-full mb-3">
                                    <Droplet className="text-indigo-600" size={32} />
                                </div>
                                <div className="text-5xl font-black text-slate-900 tracking-tight">
                                    {result.predicted_discharge_lpm}
                                </div>
                                <div className="text-slate-500 font-medium mt-1">Liters Per Minute (LPM)</div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Yield Category</span>
                                <div className={`text-2xl font-bold ${result.yield_category === 'High' ? 'text-green-600' :
                                        result.yield_category === 'Moderate' ? 'text-amber-500' : 'text-red-500'
                                    }`}>
                                    {result.yield_category} Yield
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BorewellDischarge;
