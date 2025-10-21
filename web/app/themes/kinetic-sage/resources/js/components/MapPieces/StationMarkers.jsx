import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const StationMarkers = ({ stations, icon }) => (
  <>
    {stations.map((station) => (
      <Marker
        key={`station-${station.id}`}
        position={[station.lat, station.lng]}
        icon={icon}
      >
        <Popup>
          <strong>{station.name}</strong>
          <br />
          Code: {station.station_code}
          <br />
          Lines: {station.lines.join(', ')}
        </Popup>
      </Marker>
    ))}
  </>
);

export default StationMarkers;
