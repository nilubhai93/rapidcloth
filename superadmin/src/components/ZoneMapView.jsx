import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon paths in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const ZONE_COLORS = ['#FF6B6B', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

// Helper component to capture map clicks for picking center or adding polygon boundary points
const MapClickHandler = ({ mode, onLocationSelect, onAddPolygonPoint }) => {
  useMapEvents({
    click(e) {
      if (mode === 'picker' && onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      } else if (mode === 'polygon' && onAddPolygonPoint) {
        onAddPolygonPoint(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

const ZoneMapView = ({
  zones = [],
  selectedZoneId,
  mode = 'view', // 'view', 'picker', 'polygon'
  onSelectLocation,
  onAddPolygonPoint,
  currentPolygonPoints = [],
  height = '450px'
}) => {
  // Determine center of map
  const validZones = zones.filter(z => z.coordinates && z.coordinates.lat && z.coordinates.lng);
  let center = [19.0760, 72.8777]; // Default Mumbai
  if (validZones.length > 0) {
    center = [validZones[0].coordinates.lat, validZones[0].coordinates.lng];
  } else if (currentPolygonPoints.length > 0) {
    center = [currentPolygonPoints[0].lat, currentPolygonPoints[0].lng];
  }

  return (
    <div style={{
      height,
      width: '100%',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#f5f0eb' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          mode={mode}
          onLocationSelect={onSelectLocation}
          onAddPolygonPoint={onAddPolygonPoint}
        />

        {/* Live Drawing Custom Polygon Preview */}
        {currentPolygonPoints.length > 0 && (
          <>
            {currentPolygonPoints.length >= 3 && (
              <Polygon
                positions={currentPolygonPoints.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: '#FF6B6B',
                  fillColor: '#FF6B6B',
                  fillOpacity: 0.35,
                  weight: 3,
                  dashArray: '6, 6'
                }}
              />
            )}

            {currentPolygonPoints.map((pt, idx) => (
              <Marker key={idx} position={[pt.lat, pt.lng]}>
                <Popup>
                  <div>
                    <strong>Boundary Point #{idx + 1}</strong><br />
                    Lat: {pt.lat.toFixed(4)}, Lng: {pt.lng.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Render Saved Zones (Polygons or Circles) */}
        {zones.map((zone, idx) => {
          const color = ZONE_COLORS[idx % ZONE_COLORS.length];
          const isHighlighted = selectedZoneId === zone._id;
          const hasPolygon = zone.polygon && zone.polygon.length >= 3;
          const lat = zone.coordinates?.lat;
          const lng = zone.coordinates?.lng;
          const radiusKm = zone.coordinates?.radiusKm || 5;

          return (
            <React.Fragment key={zone._id || idx}>
              {/* Custom Irregular Polygon Boundary if present */}
              {hasPolygon ? (
                <Polygon
                  positions={zone.polygon.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: isHighlighted ? '#ffffff' : color,
                    fillColor: color,
                    fillOpacity: isHighlighted ? 0.45 : 0.25,
                    weight: isHighlighted ? 3 : 2
                  }}
                />
              ) : (
                /* Fallback Circle Radius Geofence */
                lat && lng && (
                  <Circle
                    center={[lat, lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                      color: isHighlighted ? '#ffffff' : color,
                      fillColor: color,
                      fillOpacity: isHighlighted ? 0.35 : 0.2,
                      weight: isHighlighted ? 3 : 2
                    }}
                  />
                )
              )}

              {/* Marker & Popup */}
              {lat && lng && (
                <Marker position={[lat, lng]}>
                  <Popup>
                    <div style={{ padding: '0.2rem', fontFamily: 'sans-serif' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                        {zone.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>
                        Code: {zone.code} • {zone.city}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600, marginTop: '0.3rem' }}>
                        Shape: {hasPolygon ? `Custom ${zone.polygon.length}-Point Polygon` : `Circle (${radiusKm} km)`}
                      </div>
                      {zone.pincodes && zone.pincodes.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Pincodes: {zone.pincodes.join(', ')}
                        </div>
                      )}
                      {zone.metrics && (
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          <span style={{ color: '#059669' }}>{zone.metrics.sellersCount} Sellers</span>
                          <span style={{ color: '#0284c7' }}>{zone.metrics.deliveryCount} Drivers</span>
                          <span style={{ color: '#d97706' }}>{zone.metrics.customersCount} Users</span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ZoneMapView;
