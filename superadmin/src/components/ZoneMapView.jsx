import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

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

// Helper component to fly/re-center map dynamically when center coordinates change
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center[0], center[1], zoom]);
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
  const [locating, setLocating] = useState(false);

  // Determine center of map accurately based on polygon, zone coordinates, or active region
  let center = null;

  // 1. If live polygon points exist, center on polygon centroid
  if (currentPolygonPoints && currentPolygonPoints.length > 0 && currentPolygonPoints[0].lat) {
    const avgLat = currentPolygonPoints.reduce((sum, p) => sum + p.lat, 0) / currentPolygonPoints.length;
    const avgLng = currentPolygonPoints.reduce((sum, p) => sum + p.lng, 0) / currentPolygonPoints.length;
    center = [avgLat, avgLng];
  } 
  // 2. If a specific zone has polygon or coordinates
  else if (zones && zones.length > 0) {
    const activeZone = selectedZoneId 
      ? zones.find(z => z._id === selectedZoneId) || zones[0]
      : zones[0];

    if (activeZone) {
      if (activeZone.polygon && activeZone.polygon.length >= 3) {
        const poly = activeZone.polygon;
        const avgLat = poly.reduce((sum, p) => sum + p.lat, 0) / poly.length;
        const avgLng = poly.reduce((sum, p) => sum + p.lng, 0) / poly.length;
        center = [avgLat, avgLng];
      } else if (activeZone.coordinates?.lat && activeZone.coordinates?.lng) {
        center = [activeZone.coordinates.lat, activeZone.coordinates.lng];
      }
    }
  }

  // 3. Fallback: check any valid zone, or default to Kolkata/Barrackpore area (22.5726, 88.3639)
  if (!center) {
    const validZone = zones.find(z => z.coordinates?.lat && z.coordinates?.lng);
    if (validZone) {
      center = [validZone.coordinates.lat, validZone.coordinates.lng];
    } else {
      center = [22.5726, 88.3639];
    }
  }

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        if (mode === 'picker' && onSelectLocation) {
          onSelectLocation(lat, lng);
        } else if (mode === 'polygon' && onAddPolygonPoint) {
          onAddPolygonPoint(lat, lng);
        } else if (onSelectLocation) {
          onSelectLocation(lat, lng);
        }
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation Error:', err);
        alert('Could not access your location. Please grant browser location permission.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{
      height,
      width: '100%',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      {/* GPS Locate Button overlay */}
      {(mode === 'picker' || mode === 'polygon' || onSelectLocation) && (
        <button
          type="button"
          onClick={handleLocateUser}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: '#ffffff',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}
          title="Pan map to my current GPS location"
        >
          <Navigation size={14} style={{ color: '#FF6B6B' }} />
          <span>{locating ? 'Locating...' : '🎯 My GPS Location'}</span>
        </button>
      )}

      <MapContainer
        center={center}
        zoom={mode === 'view' ? 11 : 13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#f5f0eb' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={center} zoom={mode === 'view' ? 11 : 13} />

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
