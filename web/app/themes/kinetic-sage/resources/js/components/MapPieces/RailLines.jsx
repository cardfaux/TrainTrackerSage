import React from 'react';
import { Polyline } from 'react-leaflet';

const RailLines = ({ linePolylines }) => (
  <>
    {Object.entries(linePolylines).map(([line, coords]) => (
      <Polyline key={line} positions={coords} color="blue" weight={3} />
    ))}
  </>
);

export default RailLines;
