import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrainMarkerIcon from './icons/TrainMarkerIcon.jsx';

// Fix default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Linear interpolation helper
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
  const linePolylines = useRef({});

  // Fetch stations
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stations')
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((s) => ({
          ...s,
          lines: JSON.parse(s.lines),
        }));
        setStations(parsed);
        setLoading(false);

        // Build polylines for each line
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

        // Sort stations along each line
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

  // Fetch trains periodically
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

  // Animate trains smoothly along polylines
  useEffect(() => {
    if (!trains.length || !stations.length) return;

    const newPositions = {};

    trains.forEach((train) => {
      const polyline = linePolylines.current[train.line_code];
      if (!polyline || polyline.length < 2) return;

      // Fraction along the line (0-1)
      const fraction = ((train.circuit_id || train.id) % 100) / 100;

      const segmentIndex = Math.floor(fraction * (polyline.length - 1));
      const localFraction = fraction * (polyline.length - 1) - segmentIndex;

      const start = polyline[segmentIndex];
      const end = polyline[Math.min(segmentIndex + 1, polyline.length - 1)];

      newPositions[train.id] = interpolate(start, end, localFraction);
    });

    trainPositions.current = newPositions;
  }, [trains, stations]);

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
      <TileLayer
        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
        attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
      />

      {/* Draw polylines */}
      {Object.entries(linePolylines.current).map(([line, coords]) => (
        <Polyline key={line} positions={coords} color="blue" weight={3} />
      ))}

      {/* Station markers */}
      {stations.map((station) => (
        <Marker
          key={`station-${station.id}`}
          position={[station.lat, station.lng]}
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

      {/* Train markers */}
      {trains.map((train) => {
        const pos = trainPositions.current[train.id] || [38.9, -77.03];
        return (
          <Marker
            key={`train-${train.id}`}
            position={pos}
            icon={TrainMarkerIcon({ size: 30 })}
          >
            <Popup>
              <strong>Train {train.train_id}</strong>
              <br />
              Status: {train.status || 'Unknown'}
              <br />
              Service: {train.service_type || 'N/A'}
              <br />
              Direction: {train.direction || '-'}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StationsMap;
