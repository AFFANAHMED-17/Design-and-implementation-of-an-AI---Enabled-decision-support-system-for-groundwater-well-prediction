import React, { useEffect, useState } from 'react';
import { checkHealth } from '../api';
import { Link } from 'react-router-dom';
import { MapPin, Waves, Droplet, Hammer, TestTube, ArrowRight } from 'lucide-react';

const models = [
    {
        title: 'Borewell Suitability',
        description: 'Predict the suitability class and confidence based on location, lithology, and climate data.',
        path: '/suitability',
        icon: MapPin,
        color: 'from-blue-500 to-cyan-400',
        bg: 'bg-blue-50 text-blue-600'
    },
    {
        title: 'Water Bearing Depth',
        description: 'Estimate the depth of water-bearing zones using aquifer thickness and elevation.',
        path: '/depth',
        icon: Waves,
        color: 'from-teal-500 to-emerald-400',
        bg: 'bg-teal-50 text-teal-600'
    },
    {
        title: 'Borewell Discharge',
        description: 'Calculate expected yield category based on drilling parameters and geologic formations.',
        path: '/discharge',
        icon: Droplet,
        color: 'from-indigo-500 to-blue-500',
        bg: 'bg-indigo-50 text-indigo-600'
    },
    {
        title: 'Drilling Technique',
        description: 'Get recommendations for drilling methods tailored to soil, lithology, and structural features.',
        path: '/drilling',
        icon: Hammer,
        color: 'from-orange-500 to-amber-400',
        bg: 'bg-orange-50 text-orange-600'
    },
    {
        title: 'Groundwater Quality',
        description: 'Classify water quality based on major chemical parameters for drinking and irrigation.',
        path: '/quality',
        icon: TestTube,
        color: 'from-purple-500 to-pink-400',
        bg: 'bg-purple-50 text-purple-600'
    }
];

const Home = () => {
    const [apiStatus, setApiStatus] = useState('checking');

    useEffect(() => {
        checkHealth()
            .then(() => setApiStatus('online'))
            .catch((e) => {
                console.error("API Health Check Failed:", e);
                setApiStatus('offline')
            });
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
            {/* Header Section */}
            <header className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-sm font-medium shadow-sm w-fit mb-2">
                    {apiStatus === 'online' ? (
                        <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> FastAPI Backend Online</>
                    ) : apiStatus === 'offline' ? (
                        <><span className="w-2 h-2 rounded-full bg-red-500"></span> Backend Offline</>
                    ) : (
                        <><span className="w-2 h-2 rounded-full bg-amber-400"></span> Checking Backend...</>
                    )}
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    Smart Groundwater Analytics
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    An AI-powered decision support platform designed to optimize exploration, drilling, and quality assessment of groundwater resources in Tamil Nadu.
                </p>
            </header>

            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {models.map((model, idx) => {
                    const Icon = model.icon;
                    return (
                        <Link
                            key={idx}
                            to={model.path}
                            className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Top Gradient Line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${model.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                            <div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${model.bg}`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{model.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    {model.description}
                                </p>
                            </div>

                            <div className="flex items-center text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors mt-auto">
                                Open Model
                                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
