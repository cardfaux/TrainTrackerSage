import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const TrainMarkers = ({ trains, trainPositions, icon }) => (
  <>
    {trains.map((train) => {
      const pos = trainPositions[train.id] || [38.9, -77.03];
      return (
        <Marker key={`train-${train.id}`} position={pos} icon={icon}>
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
  </>
);

export default TrainMarkers;
