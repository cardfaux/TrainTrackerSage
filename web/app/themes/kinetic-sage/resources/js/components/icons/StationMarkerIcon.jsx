import L from 'leaflet';
import { FaBuilding } from 'react-icons/fa';
import { renderToString } from 'react-dom/server';

const StationMarkerIcon = L.divIcon({
  html: renderToString(
    <div style={{ fontSize: '24px', color: '#00FFFF' }}>
      <FaBuilding />
    </div>
  ),
  className: '', // remove default Leaflet styles
  iconSize: [24, 24],
  iconAnchor: [12, 12], // center the icon
});

export default StationMarkerIcon;
