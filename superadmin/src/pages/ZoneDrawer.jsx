import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ZoneMapView from '../components/ZoneMapView';
import { superAdminApi } from '../services/api';
import {
  ArrowLeft,
  Search,
  Save,
  Trash2,
  RotateCcw,
  MapPin,
  Edit3,
  Circle as CircleIcon,
  CheckCircle,
  Sparkles,
  Navigation
} from 'lucide-react';

const ZoneDrawer = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const zoneId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form & Shape State
  const [shapeType, setShapeType] = useState('polygon'); // 'polygon' or 'circle'
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    zoneId: '',
    code: '',
    city: '',
    pincodesStr: '',
    description: '',
    status: 'active',
    lat: null,
    lng: null,
    radiusKm: 5
  });

  // If editing an existing zone, fetch details
  useEffect(() => {
    if (zoneId) {
      setLoading(true);
      superAdminApi.getZoneById(zoneId)
        .then((res) => {
          const zone = res.data.zone;
          if (zone) {
            const hasPoly = zone.polygon && zone.polygon.length >= 3;
            setShapeType(hasPoly ? 'polygon' : 'circle');
            setPolygonPoints(zone.polygon || []);

            let zoneLat = zone.coordinates?.lat;
            let zoneLng = zone.coordinates?.lng;

            if (hasPoly && zone.polygon.length > 0) {
              const avgLat = zone.polygon.reduce((sum, p) => sum + p.lat, 0) / zone.polygon.length;
              const avgLng = zone.polygon.reduce((sum, p) => sum + p.lng, 0) / zone.polygon.length;
              zoneLat = parseFloat(avgLat.toFixed(4));
              zoneLng = parseFloat(avgLng.toFixed(4));
            }

            setFormData({
              name: zone.name,
              zoneId: zone.zoneId || `ZONE-${zone.code}`,
              code: zone.code,
              city: zone.city,
              pincodesStr: (zone.pincodes || []).join(', '),
              description: zone.description || '',
              status: zone.status || 'active',
              lat: zoneLat || null,
              lng: zoneLng || null,
              radiusKm: zone.coordinates?.radiusKm || 5
            });
          }
        })
        .catch((err) => {
          console.error('Failed to load zone for editing:', err);
          setError('Failed to load zone details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [zoneId]);

  // OpenStreetMap Nominatim Geocoding Search
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(parseFloat(first.lat).toFixed(4));
        const newLng = parseFloat(parseFloat(first.lon).toFixed(4));
        setFormData(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          city: prev.city || searchQuery.split(',')[0]
        }));
      } else {
        alert(`No location found for "${searchQuery}". Please try another city or landmark.`);
      }
    } catch (err) {
      console.error('Geocoding Search Error:', err);
      alert('Location search failed. Please try clicking directly on the map.');
    } finally {
      setSearching(false);
    }
  };

  const handleLocateUserGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = parseFloat(pos.coords.latitude.toFixed(4));
        const userLng = parseFloat(pos.coords.longitude.toFixed(4));
        setFormData(prev => ({
          ...prev,
          lat: userLat,
          lng: userLng
        }));
        if (shapeType === 'polygon' && polygonPoints.length === 0) {
          setPolygonPoints([{ lat: userLat, lng: userLng }]);
        }
      },
      () => alert('Could not access your location. Please grant browser location permission.'),
      { enableHighAccuracy: true }
    );
  };

  const handleAddPolygonPoint = (lat, lng) => {
    const pt = { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
    setPolygonPoints(prev => [...prev, pt]);

    if (polygonPoints.length === 0) {
      setFormData(prev => ({ ...prev, lat: pt.lat, lng: pt.lng }));
    }
  };

  const handleUndoPoint = () => {
    setPolygonPoints(prev => prev.slice(0, -1));
  };

  const handleClearPoints = () => {
    setPolygonPoints([]);
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.city) {
      alert('Please fill in Zone Name, Zone Code, and City');
      return;
    }

    if (shapeType === 'polygon' && polygonPoints.length < 3) {
      alert('Custom polygon boundary requires at least 3 points on the map. Click on the map to add boundary points!');
      return;
    }

    setSaving(true);
    setError(null);

    const pincodes = formData.pincodesStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    // Compute center lat/lng
    let centerLat = formData.lat ? parseFloat(formData.lat) : 19.0760;
    let centerLng = formData.lng ? parseFloat(formData.lng) : 72.8777;

    if (shapeType === 'polygon' && polygonPoints.length > 0) {
      const avgLat = polygonPoints.reduce((sum, p) => sum + p.lat, 0) / polygonPoints.length;
      const avgLng = polygonPoints.reduce((sum, p) => sum + p.lng, 0) / polygonPoints.length;
      centerLat = parseFloat(avgLat.toFixed(4));
      centerLng = parseFloat(avgLng.toFixed(4));
    }

    const payload = {
      name: formData.name,
      zoneId: formData.zoneId,
      code: formData.code.toUpperCase(),
      city: formData.city,
      pincodes,
      description: formData.description,
      status: formData.status,
      coordinates: {
        lat: centerLat,
        lng: centerLng,
        radiusKm: formData.radiusKm ? parseFloat(formData.radiusKm) : 5
      },
      polygon: shapeType === 'polygon' ? polygonPoints : []
    };

    try {
      if (zoneId) {
        await superAdminApi.updateZone(zoneId, payload);
      } else {
        await superAdminApi.createZone(payload);
      }
      navigate('/zones');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar
        title={zoneId ? 'Edit Fullscreen Zone Map' : 'Full-Screen Map Boundary Editor'}
        subtitle="Draw custom polygon delivery shapes or circle geofences on OpenStreetMap"
        onToggleSidebar={toggleSidebar}
      />

      <div className="content-body" style={{ paddingBottom: 0 }}>
        {/* Navigation & Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => navigate('/zones')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Zones List</span>
          </button>

          {/* Location Search Input Bar */}
          <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '460px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search city/area (e.g. Barrackpore, Mumbai, Kolkata)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={searching}>
              {searching ? 'Searching...' : 'Go'}
            </button>
            <button type="button" onClick={handleLocateUserGPS} className="btn btn-secondary" title="Use My Current GPS Location">
              <Navigation size={16} style={{ color: 'var(--accent)' }} />
              <span>GPS</span>
            </button>
          </form>

          <button onClick={handleSaveZone} className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving Zone...' : zoneId ? 'Update Zone' : 'Save Zone Boundary'}</span>
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Form Controls Bar */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Readable Zone ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.zoneId}
                onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
                placeholder="Auto-Generated (e.g. ZONE-101)"
              />
            </div>
            <div>
              <label className="form-label">Zone Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Barrackpore Fashion Hub"
                required
              />
            </div>
            <div>
              <label className="form-label">Zone Code *</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. BRCK-01"
                required
              />
            </div>
            <div>
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Barrackpore / Kolkata"
                required
              />
            </div>
            <div>
              <label className="form-label">Covered Pincodes</label>
              <input
                type="text"
                className="form-input"
                value={formData.pincodesStr}
                onChange={e => setFormData({ ...formData, pincodesStr: e.target.value })}
                placeholder="700120, 700121, 700122"
              />
            </div>
          </div>

          {/* Mode Selector & Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShapeType('polygon')}
                className={`btn btn-sm ${shapeType === 'polygon' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Edit3 size={15} />
                <span>✏️ Custom Polygon Drawing</span>
              </button>
              <button
                type="button"
                onClick={() => setShapeType('circle')}
                className={`btn btn-sm ${shapeType === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <CircleIcon size={15} />
                <span>⭕ Circle Radius Mode</span>
              </button>
            </div>

            {shapeType === 'polygon' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>
                  📍 Boundary Vertices: {polygonPoints.length} points
                </span>
                <button
                  type="button"
                  onClick={handleUndoPoint}
                  disabled={polygonPoints.length === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw size={14} />
                  <span>Undo Point</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearPoints}
                  disabled={polygonPoints.length === 0}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Clear Map Points</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Radius (km):
                  <input
                    type="number"
                    step="0.5"
                    value={formData.radiusKm}
                    onChange={e => setFormData({ ...formData, radiusKm: e.target.value })}
                    style={{ width: '70px', marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Map Canvas */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--accent-purple)',
            fontWeight: 700,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} />
            <span>
              {shapeType === 'polygon'
                ? 'CLICK ON THE MAP BELOW TO DRAW CUSTOM POLYGON BOUNDARY CORNERS'
                : 'CLICK ON THE MAP BELOW TO PICK THE CENTER OF YOUR DELIVERY CIRCLE'}
            </span>
          </div>

          <ZoneMapView
            zones={[{
              _id: 'drawer',
              name: formData.name || 'Drafting Zone Area',
              code: formData.code || 'ZONE',
              city: formData.city || '',
              coordinates: formData.lat && formData.lng ? {
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                radiusKm: parseFloat(formData.radiusKm) || 5
              } : null
            }]}
            mode={shapeType === 'polygon' ? 'polygon' : 'picker'}
            onSelectLocation={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
            onAddPolygonPoint={handleAddPolygonPoint}
            currentPolygonPoints={shapeType === 'polygon' ? polygonPoints : []}
            height="calc(100vh - 360px)"
          />
        </div>
      </div>
    </>
  );
};

export default ZoneDrawer;
