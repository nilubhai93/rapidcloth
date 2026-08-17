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

  const getCategoriesArray = (seller) => {
    const cats = seller.sellerProfile?.categories;
    if (Array.isArray(cats)) return cats;
    if (typeof cats === 'string' && cats.trim()) {
      return cats.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [];
  };

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

  const [editingSeller, setEditingSeller] = useState(null);
  const [editFormData, setEditFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    zoneId: '',
    address: '',
    categories: '',
    gstNumber: '',
    status: 'approved'
  });
  const [updatingSeller, setUpdatingSeller] = useState(false);

  const handleOpenEditModal = (seller) => {
    setEditingSeller(seller);
    setEditFormData({
      storeName: seller.sellerProfile?.storeName || seller.storeName || seller.name || '',
      ownerName: seller.name || seller.ownerName || seller.sellerProfile?.storeName || '',
      email: seller.email || '',
      phone: seller.phone || seller.sellerProfile?.businessPhone || seller.businessPhone || '',
      zoneId: seller.zone?._id || seller.zone || (zones.length > 0 ? zones[0]._id : ''),
      address: seller.sellerProfile?.businessAddress || seller.address || seller.businessAddress || '',
      categories: seller.sellerProfile?.categories || seller.categories || 'Clothing',
      gstNumber: seller.sellerProfile?.gstNumber || seller.gstNumber || '',
      status: seller.approvalStatus || seller.status || (seller.role === 'seller' ? 'approved' : 'pending')
    });
  };

  const handleSaveFullSeller = async (e) => {
    e.preventDefault();
    setUpdatingSeller(true);
    try {
      await superAdminApi.updateFullSeller(editingSeller._id, editFormData);
      setEditingSeller(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update seller');
    } finally {
      setUpdatingSeller(false);
    }
  };

  const handleAssignZone = async (sellerId, newZoneId) => {
    try {
      await superAdminApi.updateSellerZone(sellerId, newZoneId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign seller zone');
    }
  };

  return (
    <>
      <Navbar title="Sellers Directory" subtitle="Inspect registered sellers, vendor stores & customer seller applications" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Registered Sellers & Vendor Applicants</h2>
            <p className="page-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All active vendors and customer seller applications across operational zones</p>
          </div>

          {/* Filter, Search & Create Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 140px' }}>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
              <Filter size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem', flex: '2 1 200px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search store/name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
                />
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>

            <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>

            <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm" style={{ flex: '1 1 auto' }}>
              <Plus size={16} />
              <span>Add Seller</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
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
          <>
            {/* Desktop Table View */}
            <div className="desktop-table table-container">
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
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                            {seller.zone ? (
                              <span className="badge badge-purple">
                                🗺️ {seller.zone.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned Zone</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                            {seller.sellerProfile?.businessAddress || seller.sellerProfile?.city ? (
                              <div>
                                {seller.sellerProfile?.businessAddress || ''}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {seller.sellerProfile?.city || ''} {seller.sellerProfile?.pincode ? `[${seller.sellerProfile.pincode}]` : ''}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address N/A</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', maxWidth: '160px' }}>
                            {getCategoriesArray(seller).length === 0 ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clothing</span>
                            ) : (
                              getCategoriesArray(seller).map((cat, i) => (
                                <span key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                  {cat}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${seller.approvalStatus === 'approved' ? 'badge-active' : seller.approvalStatus === 'rejected' ? 'badge-inactive' : 'badge-purple'}`}>
                            {seller.approvalStatus || 'approved'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {isPending && (
                              <>
                                <button onClick={() => handleApprove(seller._id)} className="btn btn-primary btn-sm" title="Approve Seller Application">
                                  <Check size={14} />
                                  <span>Approve</span>
                                </button>
                                <button onClick={() => handleReject(seller._id)} className="btn btn-danger btn-sm" title="Reject Seller Application">
                                  <X size={14} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            <button onClick={() => handleOpenEditModal(seller)} className="btn btn-secondary btn-sm" title="Edit Seller">
                              <Edit2 size={14} />
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
              {sellers.map((seller) => {
                const isPending = seller.approvalStatus === 'pending';
                return (
                  <div key={seller._id} className="glass-card" style={{ padding: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {seller.sellerProfile?.storeName || seller.name}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Owner: {seller.name}</div>
                      </div>
                      <span className={`badge ${seller.approvalStatus === 'approved' ? 'badge-active' : seller.approvalStatus === 'rejected' ? 'badge-inactive' : 'badge-purple'}`} style={{ fontSize: '0.7rem' }}>
                        {seller.approvalStatus || 'approved'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      📧 {seller.email} • 📞 {seller.phone || 'N/A'}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.4rem 0' }}>
                      {seller.zone ? (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          🗺️ {seller.zone.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unassigned Zone</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {isPending && (
                        <>
                          <button onClick={() => handleApprove(seller._id)} className="btn btn-primary btn-sm">
                            <Check size={13} />
                            <span>Approve</span>
                          </button>
                          <button onClick={() => handleReject(seller._id)} className="btn btn-danger btn-sm">
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => handleOpenEditModal(seller)} className="btn btn-secondary btn-sm">
                        <Edit2 size={13} />
                        <span>Edit Seller</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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

      {/* Edit Seller Profile Modal */}
      {editingSeller && (
        <Modal
          isOpen={true}
          title={`Edit Seller: ${editingSeller.sellerProfile?.storeName || editingSeller.name}`}
          onClose={() => setEditingSeller(null)}
        >
          <form onSubmit={handleSaveFullSeller} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.storeName}
                  onChange={(e) => setEditFormData({ ...editFormData, storeName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Owner Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.ownerName}
                  onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Assigned Zone</label>
                <select
                  className="form-select"
                  value={editFormData.zoneId}
                  onChange={(e) => setEditFormData({ ...editFormData, zoneId: e.target.value })}
                >
                  <option value="" disabled>Select Zone</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z._id} style={{ background: '#ffffff', color: '#1a1a1a' }}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Approval Status</label>
                <select
                  className="form-select"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="approved">Approved (Active Seller)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Business Address</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Product Categories</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.categories}
                  onChange={(e) => setEditFormData({ ...editFormData, categories: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">GSTIN / Business ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.gstNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingSeller(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={updatingSeller} className="btn btn-primary">
                {updatingSeller ? 'Saving...' : 'Update & Save Seller'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default Sellers;
