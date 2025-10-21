import { useState, useEffect, useRef } from 'react';

// Linear interpolation helper
const interpolate = (a, b, fraction) => [
  a[0] + (b[0] - a[0]) * fraction,
  a[1] + (b[1] - a[1]) * fraction,
];

export default function useStationsAndTrains() {
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

  // Smooth animation
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

  return {
    stations,
    trains,
    trainPositions: trainPositions.current,
    linePolylines: linePolylines.current,
    loading,
    error,
  };
}
