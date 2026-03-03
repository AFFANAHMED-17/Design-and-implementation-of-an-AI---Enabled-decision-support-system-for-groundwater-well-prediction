import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BorewellSuitability from './pages/BorewellSuitability';
import WaterBearingDepth from './pages/WaterBearingDepth';
import BorewellDischarge from './pages/BorewellDischarge';
import DrillingTechnique from './pages/DrillingTechnique';
import GroundwaterQuality from './pages/GroundwaterQuality';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="suitability" element={<BorewellSuitability />} />
          <Route path="depth" element={<WaterBearingDepth />} />
          <Route path="discharge" element={<BorewellDischarge />} />
          <Route path="drilling" element={<DrillingTechnique />} />
          <Route path="quality" element={<GroundwaterQuality />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
