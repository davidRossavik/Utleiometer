"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const redPinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
  <path fill="#dc2626" stroke="#7f1d1d" stroke-width="2" d="M16 1C8.27 1 2 7.27 2 15c0 10.2 10.64 23.66 13.08 26.64a1.2 1.2 0 0 0 1.84 0C19.36 38.66 30 25.2 30 15 30 7.27 23.73 1 16 1z"/>
  <circle cx="16" cy="15" r="5.5" fill="#fff"/>
</svg>
`;

const redPinIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(redPinSvg)}`,
  iconSize: [32, 48],
  iconAnchor: [16, 46],
  popupAnchor: [0, -40],
});

type PropertyMapProps = {
  lat: number;
  lng: number;
  title?: string;
};

export default function PropertyMap({
  lat,
  lng,
  title = "Bolig",
}: PropertyMapProps) {
  return (
    <div className="h-[220px] w-full rounded-2xl overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={redPinIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}