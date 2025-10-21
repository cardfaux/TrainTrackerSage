import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TrainMarkers from './MapPieces/TrainMarkers.jsx';
import StationMarkers from './MapPieces/StationMarkers.jsx';
import RailLines from './MapPieces/RailLines.jsx';
import L from 'leaflet';
import TrainMarkerIcon from './icons/TrainMarkerIcon.jsx';
import StationMarkerIcon from './icons/StationMarkerIcon.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const interpolate = (a, b, fraction) => [
  a[0] + (b[0] - a[0]) * fraction,
  a[1] + (b[1] - a[1]) * fraction,
];

const StationsMap = () => {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const trainPositions = useRef({});
  const targetPositions = useRef({});
  const linePolylines = useRef({});
  const animationFrame = useRef(null);

  // Fetch stations
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stations')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((s) => ({ ...s, lines: JSON.parse(s.lines) }));
        setStations(parsed);
        setLoading(false);

        // Build polylines
        const polylines = {};
        parsed.forEach((station) => {
          station.lines.forEach((line) => {
            if (!polylines[line]) polylines[line] = [];
            polylines[line].push({
              lat: station.lat,
              lng: station.lng,
              order: station.station_order?.[line] || 0,
            });
          });
        });
        Object.keys(polylines).forEach((line) => {
          polylines[line].sort((a, b) => a.order - b.order);
          polylines[line] = polylines[line].map((s) => [s.lat, s.lng]);
        });
        linePolylines.current = polylines;
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch trains
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/trains');
        const data = await res.json();
        setTrains(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update target positions
  useEffect(() => {
    if (!trains.length || !stations.length) return;

    trains.forEach((train) => {
      const polyline = linePolylines.current[train.line_code];
      if (!polyline || polyline.length < 2) return;

      const fraction = ((train.circuit_id || train.id) % 100) / 100;
      const segmentIndex = Math.floor(fraction * (polyline.length - 1));
      const localFraction = fraction * (polyline.length - 1) - segmentIndex;

      const start = polyline[segmentIndex];
      const end = polyline[Math.min(segmentIndex + 1, polyline.length - 1)];

      targetPositions.current[train.id] = interpolate(
        start,
        end,
        localFraction
      );
      if (!trainPositions.current[train.id]) {
        trainPositions.current[train.id] = targetPositions.current[train.id];
      }
    });
  }, [trains, stations]);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      Object.keys(trainPositions.current).forEach((id) => {
        const current = trainPositions.current[id];
        const target = targetPositions.current[id];
        if (!target) return;
        trainPositions.current[id] = interpolate(current, target, 0.05);
      });
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame.current);
  }, []);

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

      <RailLines linePolylines={linePolylines.current} />
      <StationMarkers stations={stations} icon={StationMarkerIcon} />
      <TrainMarkers
        trains={trains}
        trainPositions={trainPositions.current}
        icon={TrainMarkerIcon}
      />
    </MapContainer>
  );
};

export default StationsMap;
