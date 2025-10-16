import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TrainTracker() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/trains')
      .then((res) => {
        setTrains(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load train data');
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="p-4 text-gray-500">Loading train data...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!trains.length)
    return <p className="p-4 text-gray-500">No trains available.</p>;

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🚆 Live Train Tracker</h2>
      <ul className="space-y-3">
        {trains.map((train) => (
          <li
            key={train.id}
            className="p-3 bg-white rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <span className="font-semibold">
                {train.name || 'Unnamed Train'}
              </span>{' '}
              <br />
              <span className="text-sm text-gray-500">
                {train.origin || 'Unknown Origin'} →{' '}
                {train.destination || 'Unknown Destination'}
              </span>
              <div className="text-xs text-gray-400 mt-1">
                Train ID: {train.train_id || 'N/A'} | Train Number:{' '}
                {train.train_number || 'N/A'} <br />
                Cars: {train.car_count !== null ? train.car_count : 'N/A'} |
                Direction: {train.direction !== null ? train.direction : 'N/A'}{' '}
                <br />
                Service Type: {train.service_type || 'N/A'}
              </div>
            </div>
            <div
              className={`font-bold ${
                train.status === 'On Time' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {train.status || 'Unknown'}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-400">
        Last update:{' '}
        {trains[0]?.last_update
          ? new Date(trains[0].last_update).toLocaleString()
          : 'N/A'}
      </p>
    </div>
  );
}
