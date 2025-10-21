import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import TrainMarkers from './MapPieces/TrainMarkers.jsx';
import StationMarkers from './MapPieces/StationMarkers.jsx';
import RailLines from './MapPieces/RailLines.jsx';
import TrainMarkerIcon from './icons/TrainMarkerIcon.jsx';
import StationMarkerIcon from './icons/StationMarkerIcon.jsx';
import useStationsAndTrains from './hooks/useStationsAndTrains.jsx';

const StationsMap = () => {
  const { stations, trains, trainPositions, linePolylines, loading, error } =
    useStationsAndTrains();

  if (loading) return <p>Loading map...</p>;
  if (error) return <p>Error: {error}</p>;

  const center = stations.length
    ? [
        stations.reduce((sum, s) => sum + s.lat, 0) / stations.length,
        stations.reduce((sum, s) => sum + s.lng, 0) / stations.length,
      ]
    : [38.9, -77.03];

  return (
    <MapContainer center={center} zoom={13} className="h-[500px] w-full">
      {/* <TileLayer
      url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
      attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
      /> */}
      {/* <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
      subdomains="abcd"
      /> */}
      {/* <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      subdomains="abcd"
      /> */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
      />

      <RailLines linePolylines={linePolylines} />
      <StationMarkers stations={stations} icon={StationMarkerIcon} />
      <TrainMarkers
        trains={trains}
        trainPositions={trainPositions}
        icon={TrainMarkerIcon}
      />
    </MapContainer>
  );
};

export default StationsMap;
