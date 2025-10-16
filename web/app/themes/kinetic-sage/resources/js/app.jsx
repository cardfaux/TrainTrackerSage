import.meta.glob(['../images/**', '../fonts/**']);

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TrainTracker from './components/TrainTracker.jsx';
import About from './components/About.jsx'; // example second component

// Root element
const rootElement = document.getElementById('react-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <BrowserRouter basename="/train-tracker">
      <Routes>
        <Route path="/" element={<TrainTracker />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
