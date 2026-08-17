import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { superAdminApi } from '../services/api';
import { UserCheck, Search, Filter, RefreshCw, ShoppingBag } from 'lucide-react';

const Customers = () => {
  const { toggleSidebar } = useOutletContext() || {};
  const [customers, setCustomers] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, zonesRes] = await Promise.all([
        superAdminApi.getCustomers({ zoneId: selectedZone, search: searchTerm }),
        superAdminApi.getZones()
      ]);
      setCustomers(custRes.data.customers || []);
      setZones(zonesRes.data.zones || []);
    } catch (err) {
      console.error('Fetch Customers Error:', err);
      setError(err.response?.data?.error || 'Failed to load customers');
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

  return (
    <>
      <Navbar title="Customers Directory" subtitle="Inspect registered shopper accounts and order histories" onToggleSidebar={toggleSidebar} />

      <div className="content-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Customer Accounts</h2>
            <p className="page-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Users placing fashion quick-commerce orders</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            <div style={{ position: 'relative', flex: '1 1 140px' }}>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                style={{ fontSize: '0.8rem' }}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem', flex: '2 1 180px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>

            <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No customer accounts found.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Contact Email & Phone</th>
                    <th>Primary Address & Zip</th>
                    <th>Tagged Zone</th>
                    <th>Total Orders</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => {
                    const defaultAddress = (cust.addresses || []).find(a => a.isDefault) || (cust.addresses || [])[0];
                    return (
                      <tr key={cust._id}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{cust.name}</strong>
                        </td>
                        <td>
                          <div>
                            <div>{cust.email}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cust.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td>
                          {defaultAddress ? (
                            <div style={{ fontSize: '0.85rem' }}>
                              <div>{defaultAddress.street || 'Address saved'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {defaultAddress.city || ''} {defaultAddress.zip ? `[${defaultAddress.zip}]` : ''}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Address</span>
                          )}
                        </td>
                        <td>
                          {cust.zone ? (
                            <span className="badge badge-purple">
                              🗺️ {cust.zone.name}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto Zone</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#db2777' }}>
                            <ShoppingBag size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {cust.orderCount || 0} Orders
                          </span>
                        </td>
                        <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {customers.map((cust) => {
                const defaultAddress = (cust.addresses || []).find(a => a.isDefault) || (cust.addresses || [])[0];
                return (
                  <div key={cust._id} className="glass-card" style={{ padding: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{cust.name}</h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📧 {cust.email} • 📞 {cust.phone || 'N/A'}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#db2777', fontSize: '0.75rem' }}>
                        <ShoppingBag size={13} style={{ display: 'inline', marginRight: '3px' }} />
                        {cust.orderCount || 0} Orders
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.4rem 0' }}>
                      {cust.zone ? (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          🗺️ {cust.zone.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Auto Tagged Zone</span>
                      )}
                    </div>

                    {defaultAddress && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                        📍 {defaultAddress.street || 'Address saved'}, {defaultAddress.city || ''} {defaultAddress.zip ? `[${defaultAddress.zip}]` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Customers;
