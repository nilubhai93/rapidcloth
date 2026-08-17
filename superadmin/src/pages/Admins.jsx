import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { superAdminApi } from '../services/api';
import { Users, Plus, Edit2, Shield, RefreshCw, MapPin, Check } from 'lucide-react';

const Admins = () => {
  const { toggleSidebar } = useOutletContext() || {};
  const [admins, setAdmins] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    assignedZones: []
  });
  const [saving, setSaving] = useState(false);

  // Quick Zone Area Creator inside Modal
  const [showQuickZoneForm, setShowQuickZoneForm] = useState(false);
  const [quickZone, setQuickZone] = useState({
    name: '',
    code: '',
    city: '',
    pincodesStr: ''
  });
  const [creatingZone, setCreatingZone] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsRes, zonesRes] = await Promise.all([
        superAdminApi.getAdmins(),
        superAdminApi.getZones()
      ]);
      setAdmins(adminsRes.data.admins || []);
      setZones(zonesRes.data.zones || []);
    } catch (err) {
      console.error('Fetch Admins Error:', err);
      setError(err.response?.data?.error || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      assignedZones: []
    });
    setShowQuickZoneForm(false);
    setIsModalOpen(true);
  };

  const getAdminZones = (admin) => {
    if (Array.isArray(admin.assignedZones) && admin.assignedZones.length > 0) {
      return admin.assignedZones;
    }
    if (admin.zone) {
      return [admin.zone];
    }
    return [];
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    const existingZones = getAdminZones(admin).map(z => z._id || z);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      phone: admin.phone || '',
      assignedZones: existingZones
    });
    setShowQuickZoneForm(false);
    setIsModalOpen(true);
  };

  const handleZoneToggle = (zoneId) => {
    setFormData((prev) => {
      const exists = prev.assignedZones.includes(zoneId);
      return {
        ...prev,
        assignedZones: exists
          ? prev.assignedZones.filter(id => id !== zoneId)
          : [...prev.assignedZones, zoneId]
      };
    });
  };

  const handleSelectAllZones = () => {
    const allIds = zones.map(z => z._id);
    setFormData(prev => ({ ...prev, assignedZones: allIds }));
  };

  const handleClearAllZones = () => {
    setFormData(prev => ({ ...prev, assignedZones: [] }));
  };

  const handleCreateQuickZone = async (e) => {
    e.preventDefault();
    if (!quickZone.name || !quickZone.code || !quickZone.city) {
      alert('Please fill in Zone Name, Code, and City');
      return;
    }
    setCreatingZone(true);
    try {
      const pincodes = quickZone.pincodesStr
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const payload = {
        name: quickZone.name,
        code: quickZone.code.toUpperCase(),
        city: quickZone.city,
        pincodes,
        status: 'active'
      };

      const res = await superAdminApi.createZone(payload);
      const newZone = res.data.zone;

      // Refresh zones list
      const zonesRes = await superAdminApi.getZones();
      setZones(zonesRes.data.zones || []);

      // Auto-select newly created zone
      if (newZone && newZone._id) {
        setFormData(prev => ({
          ...prev,
          assignedZones: [...prev.assignedZones, newZone._id]
        }));
      }

      setQuickZone({ name: '', code: '', city: '', pincodesStr: '' });
      setShowQuickZoneForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create zone area');
    } finally {
      setCreatingZone(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAdmin) {
        await superAdminApi.updateAdmin(editingAdmin._id, formData);
      } else {
        await superAdminApi.createAdmin(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save admin user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar title="Admin Management" subtitle="Create, assign, and manage Zone Admin accounts" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Zone Admins</h2>
            <p className="page-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign administrative control over specific operational zones</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm" style={{ flex: '1 1 auto' }}>
              <Plus size={16} />
              <span>Create New Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading admins...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Admin Name & Email</th>
                    <th>Phone Number</th>
                    <th>Assigned Operational Zones</th>
                    <th>Role</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin._id}>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{admin.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{admin.email}</div>
                        </div>
                      </td>
                      <td>{admin.phone || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {getAdminZones(admin).length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Zone Assigned</span>
                          ) : (
                            getAdminZones(admin).map((zone) => (
                              <span key={zone._id || zone} className="badge badge-purple">
                                🗺️ {typeof zone === 'object' ? zone.name : 'Zone'} {typeof zone === 'object' && zone.code ? `(${zone.code})` : ''}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">ADMIN</span>
                      </td>
                      <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEditModal(admin)} className="btn btn-secondary btn-sm">
                          <Edit2 size={15} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {admins.map((admin) => (
                <div key={admin._id} className="glass-card" style={{ padding: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{admin.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{admin.email}</div>
                    </div>
                    <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>ADMIN</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    📞 Phone: {admin.phone || 'N/A'}
                  </div>

                  <div style={{ margin: '0.4rem 0' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Assigned Zones:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {getAdminZones(admin).length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Zone Assigned</span>
                      ) : (
                        getAdminZones(admin).map((zone) => (
                          <span key={zone._id || zone} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            🗺️ {typeof zone === 'object' ? zone.name : 'Zone'}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button onClick={() => openEditModal(admin)} className="btn btn-secondary btn-sm">
                      <Edit2 size={13} />
                      <span>Edit Account</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAdmin ? 'Edit Admin Account & Zone Assignment' : 'Create Admin Account & Assign Zones'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@rapidcloth.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password {editingAdmin && '(Leave blank to keep current)'}</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required={!editingAdmin}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Operational Zones Section */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Assign Operational Zones & Areas</label>
              <button
                type="button"
                onClick={() => setShowQuickZoneForm(!showQuickZoneForm)}
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#c084fc',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {showQuickZoneForm ? 'Close Quick Zone Form' : '+ Add New Zone Area'}
              </button>
            </div>

            {/* Inline Quick Zone Creator Form */}
            {showQuickZoneForm && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.15)'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} /> Create & Define New Zone Area
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Zone Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Thane West Area"
                      value={quickZone.name}
                      onChange={e => setQuickZone({ ...quickZone, name: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Zone Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ZM-THN-01"
                      value={quickZone.code}
                      onChange={e => setQuickZone({ ...quickZone, code: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>City</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mumbai"
                      value={quickZone.city}
                      onChange={e => setQuickZone({ ...quickZone, city: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Covered Pincodes</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 400601, 400602, 400603"
                      value={quickZone.pincodesStr}
                      onChange={e => setQuickZone({ ...quickZone, pincodesStr: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateQuickZone}
                  className="btn btn-primary btn-sm"
                  disabled={creatingZone}
                  style={{ width: '100%' }}
                >
                  {creatingZone ? 'Creating Zone...' : 'Save Zone Area & Auto-Select'}
                </button>
              </div>
            )}

            {/* Quick Actions (Select All / Clear All) */}
            {zones.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSelectAllZones}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Select All
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                <button
                  type="button"
                  onClick={handleClearAllZones}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear Selections
                </button>
              </div>
            )}

            {/* Zones List with Pincodes Preview */}
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem'
            }}>
              {zones.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No operational zones created yet. Click "+ Add New Zone Area" above to create one.
                </span>
              ) : (
                zones.map((zone) => {
                  const isChecked = formData.assignedZones.includes(zone._id);
                  return (
                    <label
                      key={zone._id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(255, 107, 107, 0.12)' : 'transparent',
                        border: isChecked ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid transparent',
                        marginBottom: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleZoneToggle(zone._id)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}>
                          {zone.name} <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>({zone.code})</span> • {zone.city}
                        </div>
                        {zone.pincodes && zone.pincodes.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            📍 Covered Pincodes: {zone.pincodes.join(', ')}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Admins;
