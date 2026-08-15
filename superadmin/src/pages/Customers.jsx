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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Customer Accounts</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Users placing fashion quick-commerce orders</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '200px' }}
              />
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <button onClick={fetchData} className="btn btn-secondary">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: 'var(--radius-md)', color: '#fb7185', marginBottom: '1.5rem' }}>
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
          <div className="table-container">
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
                        <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{cust.name}</strong>
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
                        <span style={{ fontWeight: 700, color: '#f472b6' }}>
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
        )}
      </div>
    </>
  );
};

export default Customers;
