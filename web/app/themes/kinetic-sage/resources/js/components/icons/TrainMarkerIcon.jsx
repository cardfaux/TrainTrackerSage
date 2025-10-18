// TrainMarkerIcon.jsx
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { IconTrain } from '@tabler/icons-react';
import React from 'react';

const TrainMarkerIcon = ({ size = 30, stroke = 2, color = 'black' }) => {
  return new L.DivIcon({
    html: ReactDOMServer.renderToStaticMarkup(
      <div style={{ width: size, height: size }}>
        <IconTrain width={size} height={size} stroke={stroke} color={color} />
      </div>
    ),
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default TrainMarkerIcon;
