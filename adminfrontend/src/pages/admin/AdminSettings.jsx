import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/SaveRounded';
import MapIcon from '@mui/icons-material/MapRounded';
import InfoIcon from '@mui/icons-material/InfoRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import PhoneIcon from '@mui/icons-material/PhoneRounded';
import BadgeIcon from '@mui/icons-material/BadgeRounded';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function AdminSettings() {
  const { user, setUser } = useAuth();
  const [siteName, setSiteName] = useState('rapidCloth');
  const [commission, setCommission] = useState('10');
  const [deliveryFee, setDeliveryFee] = useState('49');
  const [minOrder, setMinOrder] = useState('299');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zoneDetails, setZoneDetails] = useState([]);
  const [loadingZone, setLoadingZone] = useState(true);

  useEffect(() => {
    // Fetch latest user profile to ensure assignedZones/zone populated
    authAPI.getProfile()
      .then((res) => {
        if (res.data?.user) {
          const freshUser = res.data.user;
          setUser(freshUser);
          
          let zones = [];
          if (Array.isArray(freshUser.assignedZones) && freshUser.assignedZones.length > 0) {
            zones = freshUser.assignedZones;
          } else if (freshUser.zone) {
            zones = [freshUser.zone];
          }
          setZoneDetails(zones);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch zone info in AdminSettings:', err);
      })
      .finally(() => {
        setLoadingZone(false);
      });
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', display: 'block'
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Settings & Zone Admin Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Admin account profile, assigned operational zones, and map geofences</p>
      </div>

      {/* Admin Account Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
          }}>
            <BadgeIcon sx={{ fontSize: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Admin Profile & Account Details</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Logged-in Zone Admin credentials</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Admin Name */}
          <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <PersonIcon sx={{ fontSize: '16px', color: '#60a5fa' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admin Name</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name || 'Admin User'}
            </div>
          </div>

          {/* Email ID */}
          <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <EmailIcon sx={{ fontSize: '16px', color: '#c084fc' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {user?.email || 'N/A'}
            </div>
          </div>

          {/* Phone */}
          <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <PhoneIcon sx={{ fontSize: '16px', color: '#34d399' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.phone || 'Not Provided'}
            </div>
          </div>

          {/* Role */}
          <div style={{ background: 'var(--bg-elevated)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BadgeIcon sx={{ fontSize: '16px', color: '#fbbf24' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Role</span>
            </div>
            <div>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
                background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {user?.role || 'admin'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Operational Zone Information & Interactive Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc'
          }}>
            <MapIcon sx={{ fontSize: '20px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Assigned Operational Zone & Map Geofence</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Visual map coverage & zone parameters assigned to your Admin account</p>
          </div>
        </div>

        {loadingZone ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading zone details...
          </div>
        ) : zoneDetails.length === 0 ? (
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <InfoIcon sx={{ color: '#f59e0b', fontSize: '22px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No Zone Assigned</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                You have not been assigned to a specific zone. Superadmin can assign operational zones to your account from the Superadmin Portal.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {zoneDetails.map((z, idx) => {
              const lat = z.coordinates?.lat || 19.0760;
              const lng = z.coordinates?.lng || 72.8777;
              const radiusKm = z.coordinates?.radiusKm || 5;

              return (
                <div
                  key={z._id || idx}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{z.name || 'Zone'}</h3>
                      <span style={{ fontSize: '13px', color: '#c084fc', fontWeight: 700, letterSpacing: '0.02em' }}>
                        Code: {z.code || 'N/A'}
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: z.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: z.status === 'active' ? '#34d399' : '#fbbf24',
                      border: z.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      {z.status || 'Active'}
                    </span>
                  </div>

                  {/* Interactive Map Geofence Preview */}
                  <div style={{
                    height: '240px',
                    width: '100%',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '1px solid var(--border)'
                  }}>
                    <MapContainer
                      center={[lat, lng]}
                      zoom={12}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {z.polygon && z.polygon.length >= 3 ? (
                        <Polygon
                          positions={z.polygon.map(p => [p.lat, p.lng])}
                          pathOptions={{
                            color: '#8b5cf6',
                            fillColor: '#8b5cf6',
                            fillOpacity: 0.35,
                            weight: 2
                          }}
                        />
                      ) : (
                        <Circle
                          center={[lat, lng]}
                          radius={radiusKm * 1000}
                          pathOptions={{
                            color: '#8b5cf6',
                            fillColor: '#8b5cf6',
                            fillOpacity: 0.25,
                            weight: 2
                          }}
                        />
                      )}
                      <Marker position={[lat, lng]}>
                        <Popup>
                          <strong>{z.name}</strong><br />
                          Code: {z.code}<br />
                          City: {z.city}<br />
                          Radius: {radiusKm} km
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Assigned Zone ID</label>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'var(--bg-card)', border: '1px solid rgba(139, 92, 246, 0.4)',
                        fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#c084fc', wordBreak: 'break-all'
                      }}>
                        {z.zoneId || `ZONE-${z.code}`}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>City & Coordinates</label>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)'
                      }}>
                        {z.city} (📍 {lat}, {lng})
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Covered Pincodes</label>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        display: 'flex', flexWrap: 'wrap', gap: '6px'
                      }}>
                        {(z.pincodes && z.pincodes.length > 0) ? (
                          z.pincodes.map((pin, i) => (
                            <span key={i} style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              padding: '2px 8px', borderRadius: '4px',
                              fontSize: '12px', color: 'var(--text-primary)'
                            }}>
                              {pin}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No pincodes listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {z.description && (
                    <div style={{ marginTop: '14px' }}>
                      <label style={labelStyle}>Description</label>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        {z.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSave}>
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>General Platform Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Site Name</label>
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Seller Commission (%)</label>
              <input type="number" value={commission} onChange={e => setCommission(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Delivery Fee (₹)</label>
              <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Order Amount (₹)</label>
              <input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Maintenance Mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Advanced</h2>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Maintenance Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Temporarily disable the platform for users</div>
            </div>
            <div
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              style={{
                width: '48px', height: '26px', borderRadius: '13px',
                background: maintenanceMode ? '#FF6B6B' : 'var(--border)',
                position: 'relative', cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <motion.div
                animate={{ x: maintenanceMode ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', borderRadius: '12px',
            background: saved ? '#10b981' : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            color: '#fff', fontWeight: 700, fontSize: '15px',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,107,107,0.3)'
          }}
        >
          <SaveIcon sx={{ fontSize: '20px' }} />
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </form>
    </div>
  );
}
