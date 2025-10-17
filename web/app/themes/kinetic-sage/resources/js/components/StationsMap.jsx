import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Metro Stations Map
      </h2>
      {/* <MapContainer
        center={center}
        zoom={13}
        className="h-[500px] w-full rounded-lg shadow-md"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {stations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lng]}>
            <Popup>
              <div className="font-semibold">
                {station.station_code} – {station.name}
              </div>
              <div>Lines: {station.lines.join(', ')}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer> */}
      <MapContainer center={center} zoom={13} className="h-[500px] w-full">
        <TileLayer
          url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
          attribution="&copy; OpenRailwayMap &copy; OpenStreetMap contributors"
        />
        {stations.map((station) => (
          <Marker key={station.id} position={[station.lat, station.lng]}>
            <Popup>
              {station.station_code} – {station.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default StationsMap;
