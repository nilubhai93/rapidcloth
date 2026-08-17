import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import ZoneMapView from '../components/ZoneMapView';
import { superAdminApi } from '../services/api';
import { MapPin, Plus, Edit2, Trash2, Users, Search, RefreshCw, List, Map, Edit3, Circle as CircleIcon, RotateCcw, Maximize2 } from 'lucide-react';

const Zones = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useOutletContext() || {};
  const [zones, setZones] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState('list');
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Modal & Shape State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [shapeType, setShapeType] = useState('circle'); // 'circle' or 'polygon'
  const [polygonPoints, setPolygonPoints] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    pincodesStr: '',
    description: '',
    assignedAdmins: [],
    status: 'active',
    lat: '',
    lng: '',
    radiusKm: 5
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [zonesRes, adminsRes] = await Promise.all([
        superAdminApi.getZones(),
        superAdminApi.getAdmins()
      ]);
      setZones(zonesRes.data.zones || []);
      setAdmins(adminsRes.data.admins || []);
    } catch (err) {
      console.error('Fetch Zones Error:', err);
      setError(err.response?.data?.error || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingZone(null);
    setShapeType('circle');
    setPolygonPoints([]);
    
    const defaultLat = zones.length > 0 && zones[0].coordinates?.lat ? zones[0].coordinates.lat : 22.7634;
    const defaultLng = zones.length > 0 && zones[0].coordinates?.lng ? zones[0].coordinates.lng : 88.3700;

    setFormData({
      name: '',
      zoneId: '',
      code: '',
      city: '',
      pincodesStr: '',
      description: '',
      assignedAdmins: [],
      status: 'active',
      lat: defaultLat,
      lng: defaultLng,
      radiusKm: 5
    });
    setIsModalOpen(true);
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    const hasPolygon = zone.polygon && zone.polygon.length >= 3;
    setShapeType(hasPolygon ? 'polygon' : 'circle');
    setPolygonPoints(zone.polygon || []);

    let editLat = zone.coordinates?.lat;
    let editLng = zone.coordinates?.lng;

    if (hasPolygon && zone.polygon.length > 0) {
      const avgLat = zone.polygon.reduce((sum, p) => sum + p.lat, 0) / zone.polygon.length;
      const avgLng = zone.polygon.reduce((sum, p) => sum + p.lng, 0) / zone.polygon.length;
      editLat = parseFloat(avgLat.toFixed(4));
      editLng = parseFloat(avgLng.toFixed(4));
    }

    setFormData({
      name: zone.name,
      zoneId: zone.zoneId || `ZONE-${zone.code}`,
      code: zone.code,
      city: zone.city,
      pincodesStr: (zone.pincodes || []).join(', '),
      description: zone.description || '',
      assignedAdmins: (zone.assignedAdmins || []).map(a => a._id || a),
      status: zone.status || 'active',
      lat: editLat || null,
      lng: editLng || null,
      radiusKm: zone.coordinates?.radiusKm || 5
    });
    setIsModalOpen(true);
  };

  const handleAdminToggle = (adminId) => {
    setFormData((prev) => {
      const exists = prev.assignedAdmins.includes(adminId);
      return {
        ...prev,
        assignedAdmins: exists
          ? prev.assignedAdmins.filter(id => id !== adminId)
          : [...prev.assignedAdmins, adminId]
      };
    });
  };

  const handleMapLocationPick = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4))
    }));
  };

  const handleAddPolygonPoint = (lat, lng) => {
    const pt = { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
    setPolygonPoints(prev => [...prev, pt]);

    // Update center lat/lng automatically
    if (polygonPoints.length === 0) {
      setFormData(prev => ({ ...prev, lat: pt.lat, lng: pt.lng }));
    }
  };

  const handleUndoPolygonPoint = () => {
    setPolygonPoints(prev => prev.slice(0, -1));
  };

  const handleClearPolygonPoints = () => {
    setPolygonPoints([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const pincodes = formData.pincodesStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    // Calculate center for polygon if polygon is selected
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
      code: formData.code,
      city: formData.city,
      pincodes,
      description: formData.description,
      assignedAdmins: formData.assignedAdmins,
      status: formData.status,
      coordinates: {
        lat: centerLat,
        lng: centerLng,
        radiusKm: formData.radiusKm ? parseFloat(formData.radiusKm) : 5
      },
      polygon: shapeType === 'polygon' ? polygonPoints : []
    };

    try {
      if (editingZone) {
        await superAdminApi.updateZone(editingZone._id, payload);
      } else {
        await superAdminApi.createZone(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this zone?')) return;
    try {
      await superAdminApi.deleteZone(zoneId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete zone');
    }
  };

  return (
    <>
      <Navbar title="Zone Management" subtitle="Create, edit, and draw custom operational delivery boundaries" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Operational Zones</h2>
            <p className="page-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Define custom irregular delivery shapes or radius geofences</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.2rem',
              flex: '1 1 auto'
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'list' ? 'var(--gradient-primary)' : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <List size={14} />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'map' ? 'var(--gradient-primary)' : 'transparent',
                  color: viewMode === 'map' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <Map size={14} />
                <span>Map</span>
              </button>
            </div>

            <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => navigate('/zones/draw')} className="btn btn-secondary btn-sm" title="Open Fullscreen Map Boundary Editor">
              <Maximize2 size={14} />
              <span className="desktop-only">Map Drawer</span>
            </button>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm" style={{ flex: '1 1 auto' }}>
              <Plus size={16} />
              <span>New Zone</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading zones...</div>
        ) : viewMode === 'map' ? (
          /* Interactive Map View */
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Zone:</span>
              <button
                onClick={() => setSelectedZoneId(null)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: selectedZoneId === null ? 'var(--accent)' : 'transparent',
                  color: selectedZoneId === null ? '#fff' : 'var(--text-secondary)'
                }}
              >
                All Zones
              </button>
              {zones.map((z) => (
                <button
                  key={z._id}
                  onClick={() => setSelectedZoneId(z._id)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    background: selectedZoneId === z._id ? 'var(--accent)' : 'transparent',
                    color: selectedZoneId === z._id ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {z.name} ({z.code})
                </button>
              ))}
            </div>
            <ZoneMapView zones={zones} selectedZoneId={selectedZoneId} height="480px" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Zone ID</th>
                    <th>Zone Code & Name</th>
                    <th>City</th>
                    <th>Geofence Boundary Type</th>
                    <th>Covered Pincodes</th>
                    <th>Assigned Admins</th>
                    <th>Metrics (Sellers / Drivers / Users)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => {
                    const hasPoly = zone.polygon && zone.polygon.length >= 3;
                    return (
                      <tr key={zone._id}>
                        <td>
                          <span className="badge badge-purple" style={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.04em' }}>
                            {zone.zoneId || `ZONE-${zone.code}`}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{zone.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                              {zone.code}
                            </div>
                          </div>
                        </td>
                        <td>{zone.city}</td>
                        <td>
                          {hasPoly ? (
                            <span className="badge badge-purple">
                              ✏️ Custom {zone.polygon.length}-Point Polygon
                            </span>
                          ) : zone.coordinates?.lat ? (
                            <span className="badge badge-blue">
                              ⭕ Circle Radius ({zone.coordinates.radiusKm || 5} km)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Geofence</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '220px' }}>
                            {(zone.pincodes || []).map((pin, i) => (
                              <span key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                {pin}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {(zone.assignedAdmins || []).length === 0 ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned</span>
                            ) : (
                              (zone.assignedAdmins || []).map((admin) => (
                                <span key={admin._id || admin} style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                                  👤 {admin.name || 'Admin'}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            <span style={{ color: '#34d399', fontWeight: 700 }}>{zone.metrics?.sellersCount || 0} Sellers</span> •{' '}
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{zone.metrics?.deliveryCount || 0} Drivers</span> •{' '}
                            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{zone.metrics?.customersCount || 0} Users</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${zone.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                            {zone.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button onClick={() => navigate(`/zones/draw?id=${zone._id}`)} className="btn btn-secondary btn-sm" title="Draw Zone on Fullscreen Map">
                              <Maximize2 size={15} />
                              <span>Draw Map</span>
                            </button>
                            <button onClick={() => openEditModal(zone)} className="btn btn-secondary btn-sm" title="Edit Zone">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => handleDelete(zone._id)} className="btn btn-danger btn-sm" title="Delete Zone">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {zones.map((zone) => {
                const hasPoly = zone.polygon && zone.polygon.length >= 3;
                return (
                  <div key={zone._id} className="glass-card" style={{ padding: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{zone.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                          {zone.code} • {zone.city}
                        </span>
                      </div>
                      <span className={`badge ${zone.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {zone.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.4rem 0' }}>
                      <span className="badge badge-purple" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {zone.zoneId || `ZONE-${zone.code}`}
                      </span>
                      {hasPoly ? (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          ✏️ {zone.polygon.length}-Pt Poly
                        </span>
                      ) : (
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                          ⭕ Circle ({zone.coordinates?.radiusKm || 5} km)
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '0.45rem 0.65rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      margin: '0.4rem 0'
                    }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{zone.metrics?.sellersCount || 0} Sellers</span>
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>{zone.metrics?.deliveryCount || 0} Drivers</span>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>{zone.metrics?.customersCount || 0} Users</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <button onClick={() => navigate(`/zones/draw?id=${zone._id}`)} className="btn btn-secondary btn-sm" title="Draw Zone">
                        <Maximize2 size={13} />
                        <span>Draw</span>
                      </button>
                      <button onClick={() => openEditModal(zone)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDelete(zone._id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal for Creating / Editing Zone with Circle & Polygon Boundary Tools */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Edit Zone & Boundary Shape' : 'Create Zone & Define Geofence Boundary'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Zone Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. South Mumbai Central"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Zone ID (Readable)</label>
              <input
                type="text"
                className="form-input"
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                placeholder="Auto-Generated (e.g. ZONE-101)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zone Code *</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. ZM-MUM-01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
                required
              />
            </div>
          </div>

          {/* Boundary Shape Type Selection */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Select Delivery Boundary Shape Type</label>
              <button
                type="button"
                onClick={() => navigate(editingZone ? `/zones/draw?id=${editingZone._id}` : '/zones/draw')}
                style={{
                  background: 'var(--gradient-primary)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Maximize2 size={13} />
                <span>Fullscreen Editor</span>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShapeType('circle')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: shapeType === 'circle' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: shapeType === 'circle' ? 'rgba(255, 107, 107, 0.12)' : 'var(--bg-secondary)',
                  color: shapeType === 'circle' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <CircleIcon size={15} />
                <span>Circle Radius</span>
              </button>
              <button
                type="button"
                onClick={() => setShapeType('polygon')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: shapeType === 'polygon' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: shapeType === 'polygon' ? 'rgba(255, 107, 107, 0.12)' : 'var(--bg-secondary)',
                  color: shapeType === 'polygon' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Edit3 size={15} />
                <span>✏️ Custom Polygon</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                {shapeType === 'polygon' ? '✏️ Click Map to Draw Points' : '📍 Click Map to Pick Center'}
              </label>
              {shapeType === 'polygon' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleUndoPolygonPoint}
                    disabled={polygonPoints.length === 0}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Undo Point
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                  <button
                    type="button"
                    onClick={handleClearPolygonPoints}
                    disabled={polygonPoints.length === 0}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear All ({polygonPoints.length})
                  </button>
                </div>
              )}
            </div>

            <ZoneMapView
              zones={[{
                _id: 'picker',
                name: formData.name || 'Selected Zone Area',
                code: formData.code || 'ZONE',
                city: formData.city || '',
                coordinates: formData.lat && formData.lng ? {
                  lat: parseFloat(formData.lat),
                  lng: parseFloat(formData.lng),
                  radiusKm: parseFloat(formData.radiusKm) || 5
                } : null
              }]}
              mode={shapeType === 'polygon' ? 'polygon' : 'picker'}
              onSelectLocation={handleMapLocationPick}
              onAddPolygonPoint={handleAddPolygonPoint}
              currentPolygonPoints={shapeType === 'polygon' ? polygonPoints : []}
              height="200px"
            />

            {shapeType === 'polygon' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.35rem', fontWeight: 600 }}>
                💡 Click 3 or more points on the map above to enclose your custom delivery boundary shape! (Points added: {polygonPoints.length})
              </div>
            )}
          </div>

          {shapeType === 'circle' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="19.0760"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="72.8777"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Geofence Radius (km)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.radiusKm}
                  onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Pincodes (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.pincodesStr}
              onChange={(e) => setFormData({ ...formData, pincodesStr: e.target.value })}
              placeholder="400001, 400002, 400003"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Admins to Zone</label>
            <div style={{
              maxHeight: '120px',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem'
            }}>
              {admins.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No admin users created yet.</span>
              ) : (
                admins.map((admin) => (
                  <label
                    key={admin._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      color: formData.assignedAdmins.includes(admin._id) ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedAdmins.includes(admin._id)}
                      onChange={() => handleAdminToggle(admin._id)}
                    />
                    <span>{admin.name} ({admin.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Zones;
