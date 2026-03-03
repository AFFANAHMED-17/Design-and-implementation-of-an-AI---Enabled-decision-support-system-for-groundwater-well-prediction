import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    Home,
    MapPin,
    Waves,
    Droplet,
    Hammer,
    TestTube
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/suitability', label: 'Borewell Suitability', icon: MapPin },
    { path: '/depth', label: 'Water Bearing Depth', icon: Waves },
    { path: '/discharge', label: 'Borewell Discharge', icon: Droplet },
    { path: '/drilling', label: 'Drilling Technique', icon: Hammer },
    { path: '/quality', label: 'Groundwater Quality', icon: TestTube },
];

const Layout = () => {
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 select-none">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        AI Groundwater DSS
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Tamil Nadu Decision System</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon size={18} className="shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer/Status in sidebar */}
                <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex justify-between items-center">
                        <span>System Status</span>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-600 font-medium">Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative">
                {/* Header decoration */}
                <div className="h-48 absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-50/80 to-transparent -z-10 pattern-dots border-b border-transparent"></div>
                <div className="p-8 max-w-6xl mx-auto min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
