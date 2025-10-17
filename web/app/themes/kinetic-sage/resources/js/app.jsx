import.meta.glob(['../images/**', '../fonts/**']);

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TrainTracker from './components/TrainTracker.jsx';
import About from './components/About.jsx';
import Stations from './components/StationsMap.jsx';

// Root element
const rootElement = document.getElementById('react-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <HashRouter>
      <Routes>
        // route http://train-tracker.test/train-tracker/#/
        <Route path="/" element={<TrainTracker />} />
        // route http://train-tracker.test/train-tracker/#about
        <Route path="/about" element={<About />} />
        // route http://train-tracker.test/train-tracker/#/stations
        <Route path="/stations" element={<Stations />} />
      </Routes>
    </HashRouter>
  );
}
