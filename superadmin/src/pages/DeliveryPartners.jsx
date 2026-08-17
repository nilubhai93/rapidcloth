import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { superAdminApi } from '../services/api';
import { Truck, Search, Filter, RefreshCw, Radio, Plus, MapPin, ShieldCheck } from 'lucide-react';

const DeliveryPartners = () => {
  const { toggleSidebar } = useOutletContext() || {};
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneSummary, setZoneSummary] = useState([]);
  const [unassignedStats, setUnassignedStats] = useState({ total: 0, online: 0, offline: 0 });
  const [selectedZone, setSelectedZone] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    zoneId: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    aadharOrLicense: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [partnersRes, zonesRes] = await Promise.all([
        superAdminApi.getDeliveryPartners({
          zoneId: selectedZone,
          status: statusFilter,
          search: searchTerm
        }),
        superAdminApi.getZones()
      ]);
      setDeliveryPartners(partnersRes.data.deliveryPartners || []);
      setZoneSummary(partnersRes.data.zoneSummary || []);
      setUnassignedStats(partnersRes.data.unassignedStats || { total: 0, online: 0, offline: 0 });
      setZones(zonesRes.data.zones || []);
    } catch (err) {
      console.error('Fetch Delivery Partners Error:', err);
      setError(err.response?.data?.error || 'Failed to load delivery partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedZone, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      zoneId: zones[0]?._id || '',
      vehicleType: 'Bike',
      vehicleNumber: '',
      aadharOrLicense: ''
    });
    setIsModalOpen(true);
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await superAdminApi.createDeliveryPartner(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create delivery partner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar title="Delivery Partners Directory" subtitle="Manage delivery drivers and fleet status across operational zones" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        {/* Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Delivery Fleet Directory</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live zone breakdown, driver availability, and fleet statistics</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '180px' }}>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name} ({zone.zoneId || zone.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative', width: '140px' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search driver or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '180px' }}
              />
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <button onClick={fetchData} className="btn btn-secondary">
              <RefreshCw size={16} />
            </button>

            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              <Plus size={18} />
              <span>Add Delivery Partner</span>
            </button>
          </div>
        </div>

        {/* Zone Breakdown Stats Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Card for All Zones */}
          <div
            className="glass-card"
            onClick={() => setSelectedZone('')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: selectedZone === '' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
              background: selectedZone === '' ? 'rgba(255, 107, 107, 0.12)' : 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 700 }}>
                GLOBAL FLEET
              </span>
              <Truck size={20} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>All Operational Zones</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
                🛵 {zoneSummary.reduce((acc, z) => acc + z.totalPartners, 0) + unassignedStats.total} Drivers
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                🟢 {zoneSummary.reduce((acc, z) => acc + z.onlinePartners, 0) + unassignedStats.online} Online
              </span>
            </div>
          </div>

          {/* Cards for Each Specific Zone */}
          {zoneSummary.map((z) => {
            const isSelected = selectedZone === z.zoneId;
            return (
              <div
                key={z.zoneId}
                className="glass-card"
                onClick={() => setSelectedZone(z.zoneId)}
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(255, 107, 107, 0.12)' : 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', background: 'rgba(255, 107, 107, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    {z.readableZoneId}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {z.city}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {z.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                    👥 {z.totalPartners} Drivers
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    🟢 {z.onlinePartners} Online
                  </span>
                  <span className="badge badge-inactive" style={{ fontSize: '0.75rem' }}>
                    🔴 {z.offlinePartners} Offline
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading delivery partners...</div>
        ) : deliveryPartners.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No delivery partners registered in this zone. Click <strong>"+ Add Delivery Partner"</strong> above to add a new driver.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact Details</th>
                  <th>Assigned Zone & Zone ID</th>
                  <th>Vehicle Type & Plate</th>
                  <th>Online Status</th>
                  <th>COD Cash Held</th>
                  <th>Lifetime Earnings</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPartners.map((driver) => {
                  const isOnline = driver.deliveryProfile?.isOnline;
                  const zoneInfo = driver.zone;
                  return (
                    <tr key={driver._id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{driver.name}</strong>
                      </td>
                      <td>
                        <div>
                          <div>{driver.phone || 'N/A'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{driver.email}</div>
                        </div>
                      </td>
                      <td>
                        {zoneInfo ? (
                          <div>
                            <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={12} />
                              {zoneInfo.name}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                              {zoneInfo.zoneId || `ZONE-${zoneInfo.code}`} ({zoneInfo.city})
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            🛵 {driver.deliveryProfile?.vehicleType || 'Bike'}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {driver.deliveryProfile?.vehicleNumber || 'No Plate'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isOnline ? 'badge-success' : 'badge-inactive'}`}>
                          <Radio size={12} />
                          {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>
                          ₹{driver.deliveryProfile?.cashCollected || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>
                          ₹{driver.deliveryProfile?.totalEarnings || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating New Delivery Partner */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Delivery Partner / Driver"
      >
        <form onSubmit={handleCreateDriver}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. driver@rapidcloth.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Operational Zone</label>
              <select
                className="form-select"
                value={formData.zoneId}
                onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
              >
                <option value="">Select Operational Zone...</option>
                {zones.map(z => (
                  <option key={z._id} value={z._id}>
                    {z.name} ({z.zoneId || z.code}) - {z.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select
                className="form-select"
                value={formData.vehicleType}
                onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
              >
                <option value="Bike">Motorcycle / Bike</option>
                <option value="EV Scooter">Electric Scooter (EV)</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Van">Delivery Van</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle License Plate</label>
              <input
                type="text"
                className="form-input"
                value={formData.vehicleNumber}
                onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="MH-01-AB-1234"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Aadhar / Driver License No.</label>
            <input
              type="text"
              className="form-input"
              value={formData.aadharOrLicense}
              onChange={e => setFormData({ ...formData, aadharOrLicense: e.target.value })}
              placeholder="DL-1420110012345"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Driver Account'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DeliveryPartners;
