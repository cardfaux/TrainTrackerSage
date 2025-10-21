import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrainMarkerIcon from './icons/TrainMarkerIcon.jsx';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const StationsMap = () => {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stations
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stations')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        const parsed = data.map((station) => ({
          ...station,
          lines: JSON.parse(station.lines),
        }));
        setStations(parsed);
        setLoading(false);
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
        if (!res.ok) throw new Error('Failed to fetch train data');
        const data = await res.json();
        setTrains(data);
      } catch (err) {
        console.error('Error fetching trains:', err);
      }
    };

    fetchTrains(); // Initial fetch
    const interval = setInterval(fetchTrains, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Loading map...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-8">Error: {error}</p>;

  // Center map on average coordinates
  const center = stations.length
    ? [
        stations.reduce((sum, s) => sum + s.lat, 0) / stations.length,
        stations.reduce((sum, s) => sum + s.lng, 0) / stations.length,
      ]
    : [38.9, -77.03]; // fallback

  /**
   * Simple helper: interpolate a point between two lat/lng pairs
   * fraction = 0 → start, fraction = 1 → end
   */
  const interpolate = (a, b, fraction) => {
    return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
  };

  /**
   * Generate approximate coordinates for a train.
   * For now, we’ll map circuit_id into a position between two nearby stations.
   */
  const getTrainPosition = (train, stations) => {
    if (stations.length < 2) return [38.9, -77.03]; // fallback

    // Use circuit_id to consistently place train
    const idx = (train.circuit_id || train.id) % (stations.length - 1); // safe fallback
    const start = stations[idx];
    const end = stations[idx + 1];

    if (!start || !end) return [38.9, -77.03];

    // Fraction of the way between the two stations
    const fraction = (train.circuit_id % 10) / 10; // 0–1 range
    return interpolate([start.lat, start.lng], [end.lat, end.lng], fraction);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Metro Tracker Map</h2>
      <MapContainer center={center} zoom={13} className="h-[500px] w-full">
        <TileLayer
          url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
          attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
        />

        {/* Station Markers */}
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

        {/* Train Markers */}
        {trains.map((train) => {
          const [lat, lng] = getTrainPosition(train, stations);
          return (
            <Marker
              key={`train-${train.id}`}
              position={[lat, lng]}
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
    </div>
  );
};

export default StationsMap;
