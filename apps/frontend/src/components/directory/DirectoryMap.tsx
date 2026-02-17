'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

interface MapMarker {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  type: string;
  city: string;
}

interface DirectoryMapProps {
  markers: MapMarker[];
}

// Lazy-load React Leaflet (SSR incompatible)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false },
);

const TYPE_LABELS: Record<string, string> = {
  public: 'Public',
  association: 'Association',
  private: 'Privé',
  community: 'Communautaire',
};

// Centre par défaut : France métropolitaine
const DEFAULT_CENTER: [number, number] = [46.603354, 1.888334];
const DEFAULT_ZOOM = 6;

export function DirectoryMap({ markers }: DirectoryMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (markers.length === 0) return DEFAULT_CENTER;
    const avgLat = markers.reduce((s, m) => s + m.latitude, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.longitude, 0) / markers.length;
    return [avgLat, avgLng];
  }, [markers]);

  return (
    <div className="h-[400px] w-full">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
            <Popup>
              <div className="text-sm">
                <strong>{marker.name}</strong>
                <br />
                <span className="text-muted-foreground">
                  {TYPE_LABELS[marker.type] || marker.type}
                </span>
                {marker.city && (
                  <>
                    <br />
                    {marker.city}
                  </>
                )}
                <br />
                <a
                  href={`/annuaire/${marker.slug}`}
                  className="text-primary-700 hover:underline"
                >
                  Voir la fiche
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
