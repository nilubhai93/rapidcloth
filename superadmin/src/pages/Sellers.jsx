import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { superAdminApi } from '../services/api';
import { Store, Search, Filter, RefreshCw, Package, Plus, CheckCircle, Clock } from 'lucide-react';

const Sellers = () => {
  const { toggleSidebar } = useOutletContext() || {};
  const [sellers, setSellers] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  // Create Seller Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    businessAddress: '',
    gstNumber: '',
    categories: '',
    zoneId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sellersRes, zonesRes] = await Promise.all([
        superAdminApi.getSellers({ zoneId: selectedZone, search: searchTerm }),
        superAdminApi.getZones()
      ]);
      setSellers(sellersRes.data.sellers || []);
      setZones(zonesRes.data.zones || []);
    } catch (err) {
      console.error('Fetch Sellers Error:', err);
      setError(err.response?.data?.error || 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedZone]);

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
      storeName: '',
      businessAddress: '',
      gstNumber: '',
      categories: '',
      zoneId: zones[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await superAdminApi.createSeller(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create seller');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveSeller = async (sellerId, applicationId) => {
    if (!window.confirm('Are you sure you want to approve this user as an active seller?')) return;
    setApprovingId(sellerId);
    try {
      await superAdminApi.approveSeller(sellerId, { applicationId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve seller application');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <>
      <Navbar title="Sellers Directory" subtitle="Inspect registered sellers, vendor stores & customer seller applications" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Registered Sellers & Vendor Applicants</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All active vendors and customer seller applications across operational zones</p>
          </div>

          {/* Filter, Search & Create Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '180px' }}>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
              <Filter size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search store or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <button onClick={fetchData} className="btn btn-secondary">
              <RefreshCw size={16} />
            </button>

            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              <Plus size={18} />
              <span>Add New Seller</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fb7185', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading sellers...</div>
        ) : sellers.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No sellers or seller applications found under the selected zone. Click <strong>"+ Add New Seller"</strong> above to register a new vendor.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Store & Owner Name</th>
                  <th>Contact Info</th>
                  <th>Assigned Zone</th>
                  <th>Business Address</th>
                  <th>Categories</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  const isPending = seller.approvalStatus === 'pending';
                  return (
                    <tr key={seller._id}>
                      <td>
                        <div>
                          <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                            {seller.sellerProfile?.storeName || seller.name}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Owner: {seller.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{seller.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{seller.phone || seller.sellerProfile?.businessPhone || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        {seller.zone ? (
                          <span className="badge badge-purple">
                            🗺️ {seller.zone.name} ({seller.zone.code})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {seller.sellerProfile?.businessAddress || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {seller.sellerProfile?.categories || 'Clothing'}
                        </span>
                      </td>
                      <td>
                        {isPending ? (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} />
                            Pending Approval
                          </span>
                        ) : (
                          <span className="badge badge-active">
                            Active Seller
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <button
                            onClick={() => handleApproveSeller(seller._id, seller.sellerProfile?.applicationId)}
                            className="btn btn-primary btn-sm"
                            disabled={approvingId === seller._id}
                          >
                            <CheckCircle size={14} />
                            <span>{approvingId === seller._id ? 'Approving...' : 'Approve Seller'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                            Approved ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating New Seller */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Vendor / Seller"
      >
        <form onSubmit={handleCreateSeller}>
          <div className="form-group">
            <label className="form-label">Store / Business Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="e.g. Urban Threads Studio"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Owner Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. seller@store.com"
                required
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
                  {z.name} ({z.code}) - {z.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Business Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.businessAddress}
              onChange={e => setFormData({ ...formData, businessAddress: e.target.value })}
              placeholder="Store address or hub location"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.gstNumber}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AABCU9603R1ZM"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categories</label>
              <input
                type="text"
                className="form-input"
                value={formData.categories}
                onChange={e => setFormData({ ...formData, categories: e.target.value })}
                placeholder="Ethnic, Casual, Denim"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Vendor Account'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Sellers;
