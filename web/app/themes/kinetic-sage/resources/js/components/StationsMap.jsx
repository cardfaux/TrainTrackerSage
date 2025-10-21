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
    // <MapContainer center={center} zoom={13} className="h-[500px] w-full">
    //   <TileLayer
    //     url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
    //     attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
    //     className="night-map-tile-remove"
    //   />
    //   {/* <TileLayer
    //   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    //   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    //   subdomains="abcd"
    //   /> */}
    //   {/* <TileLayer
    //   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    //   attribution="&copy; OpenStreetMap contributors &copy; CARTO"
    //   subdomains="abcd"
    //   /> */}
    //   {/* <TileLayer
    //     url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    //     attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
    //   /> */}

    //   {/* Dark overlay */}
    //   <div
    //     style={{
    //       position: 'absolute',
    //       top: 0,
    //       left: 0,
    //       width: '100%',
    //       height: '100%',
    //       pointerEvents: 'none', // so map interactions still work
    //       background: 'rgba(0, 0, 0, 0.5)', // adjust opacity for darkness
    //       mixBlendMode: 'multiply', // darkens tiles while keeping details
    //       zIndex: 1000,
    //     }}
    //   />

    //   <RailLines linePolylines={linePolylines} />
    //   <StationMarkers stations={stations} icon={StationMarkerIcon} />
    //   <TrainMarkers
    //     trains={trains}
    //     trainPositions={trainPositions}
    //     icon={TrainMarkerIcon}
    //   />
    // </MapContainer>
    <MapContainer
      center={center}
      zoom={13}
      className="h-[500px] w-full relative"
    >
      <TileLayer
        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
        attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
        className="night-map-tile-remove"
      />
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
      {/* <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
      /> */}

      {/* Night-mode overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // allows interaction with map
          background: 'rgba(0, 0, 0, 0.5)', // adjust for darkness
          mixBlendMode: 'multiply', // darkens tiles but keeps details
          zIndex: 50,
        }}
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
