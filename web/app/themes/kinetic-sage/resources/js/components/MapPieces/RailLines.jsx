import React from 'react';
import { Polyline } from 'react-leaflet';

const RailLines = ({ linePolylines }) => {
  if (!linePolylines) return null; // guard clause

  return (
    <>
      {Object.entries(linePolylines).map(([line, coords]) => (
        <Polyline key={line} positions={coords} color="blue" weight={3} />
      ))}
    </>
  );
};

export default RailLines;
