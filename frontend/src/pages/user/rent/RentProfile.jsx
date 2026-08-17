import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import RentNavbar from '../../../components/RentNavbar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import StraightenIcon from '@mui/icons-material/StraightenRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';

function InfoItem({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '12px', background: '#0e1838', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ color: '#f5d061', marginTop: '2px' }}>{icon}</div>
            <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700, marginTop: '2px', display: 'block' }}>{value}</span>
            </div>
        </div>
    );
}

function SizeChip({ label, value }) {
    return (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#0e1838', border: '1px solid rgba(212, 175, 55, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            <span style={{ fontSize: '18px', color: '#f5d061', fontWeight: 900, marginTop: '4px', display: 'block' }}>{value}</span>
        </div>
    );
}

export default function RentProfile() {
    const { user, logout, updateProfile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        topSize: user?.sizeProfile?.topSize || '',
        bottomSize: user?.sizeProfile?.bottomSize || '',
        shoeSize: user?.sizeProfile?.shoeSize || ''
    });
    const [bank, setBank] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: ''
    });
    const [bankEditing, setBankEditing] = useState(false);
    const [loadingBank, setLoadingBank] = useState(true);

    useState(() => {
        if (isAuthenticated) {
            import('../../../api').then(({ authAPI }) => {
                authAPI.getBankDetails().then(res => {
                    if (res.data?.details) setBank(res.data.details);
                    setLoadingBank(false);
                }).catch(() => setLoadingBank(false));
            });
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a1128', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>
                <RentNavbar activeTab="rent" />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '16px', fontWeight: 800, color: '#ffffff' }}>Please Sign In</h2>
                    <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Sign in to view your profile details and sizing preferences.</p>
                    <Link to="/login?redirect=/rent/profile" style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>Sign In</Link>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            await updateProfile({
                name: form.name, phone: form.phone,
                sizeProfile: { topSize: form.topSize, bottomSize: form.bottomSize, shoeSize: form.shoeSize, preferredBrands: user?.sizeProfile?.preferredBrands || {} }
            });
            setEditing(false);
        } catch (e) { console.error(e); }
    };

    const handleSaveBank = async () => {
        try {
            const { authAPI } = await import('../../../api');
            await authAPI.updateBankDetails(bank);
            setBankEditing(false);
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => { logout(); navigate('/rent'); };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: '#0e1838', border: '1.5px solid rgba(212, 175, 55, 0.3)',
        color: '#ffffff', fontSize: '14px', outline: 'none', fontWeight: 500, boxSizing: 'border-box'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a1128', color: '#ffffff', fontFamily: 'var(--font-sans)' }}>
            <RentNavbar activeTab="rent" />
            <div className="container" style={{ padding: '32px 24px 60px', maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>Rental Account</h1>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px', borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <LogoutIcon sx={{ fontSize: '16px' }} /> Sign Out
                    </button>
                </div>

                {/* User Info Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '24px', borderRadius: '20px', background: '#111d40', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '22px', fontWeight: 900, color: '#0a1128',
                            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.35)'
                        }}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>{user?.name}</h2>
                            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{user?.email}</p>
                        </div>
                        <button onClick={() => setEditing(!editing)} style={{
                            marginLeft: 'auto', padding: '6px 16px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128',
                            fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)'
                        }}>{editing ? 'Cancel' : 'Edit'}</button>
                    </div>

                    {editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Phone</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91-XXXXXXXXXX" style={inputStyle} />
                            </div>
                            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} style={{ gridColumn: 'span 2', padding: '12px', background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>Save Changes</motion.button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <InfoItem icon={<PersonOutlineIcon sx={{ fontSize: '20px', color: '#f5d061' }} />} label="Phone" value={user?.phone || 'Not set'} />
                            <InfoItem icon={<LocalShippingOutlinedIcon sx={{ fontSize: '20px', color: '#f5d061' }} />} label="Default Address" value={user?.addresses?.[0] ? `${user.addresses[0].city}, ${user.addresses[0].zip}` : 'Not set'} />
                        </div>
                    )}
                </motion.div>

                {/* Size Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ padding: '24px', borderRadius: '20px', background: '#111d40', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <StraightenIcon sx={{ color: '#f5d061', fontSize: '22px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Size Profile — Smart Fit</h3>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
                        Tell us your sizes and preferred brands. Our AI will recommend the perfect rental fit.
                    </p>

                    {editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Top</label>
                                <input value={form.topSize} onChange={e => setForm({ ...form, topSize: e.target.value })} placeholder="M" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Bottom</label>
                                <input value={form.bottomSize} onChange={e => setForm({ ...form, bottomSize: e.target.value })} placeholder="32" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Shoe</label>
                                <input value={form.shoeSize} onChange={e => setForm({ ...form, shoeSize: e.target.value })} placeholder="9" style={inputStyle} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <SizeChip label="Top Size" value={user?.sizeProfile?.topSize || '—'} />
                            <SizeChip label="Bottom Size" value={user?.sizeProfile?.bottomSize || '—'} />
                            <SizeChip label="Shoe Size" value={user?.sizeProfile?.shoeSize || '—'} />
                        </div>
                    )}
                </motion.div>

                {/* Bank Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ padding: '24px', borderRadius: '20px', background: '#111d40', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <AccountBalanceIcon sx={{ color: '#f5d061', fontSize: '22px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Security Refund Details</h3>
                        <button onClick={() => setBankEditing(!bankEditing)} style={{
                            marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128',
                            fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer'
                        }}>{bankEditing ? 'Cancel' : (bank.accountNumber ? 'Edit' : 'Add')}</button>
                    </div>

                    {bankEditing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Account Holder Name</label>
                                <input value={bank.accountHolderName} onChange={e => setBank({ ...bank, accountHolderName: e.target.value })} placeholder="John Doe" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Account Number</label>
                                <input value={bank.accountNumber} onChange={e => setBank({ ...bank, accountNumber: e.target.value })} placeholder="XXXX XXXX XXXX" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>IFSC Code</label>
                                <input value={bank.ifscCode} onChange={e => setBank({ ...bank, ifscCode: e.target.value })} placeholder="SBIN000XXXX" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Bank Name</label>
                                <input value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })} placeholder="State Bank of India" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#f5d061', marginBottom: '6px', display: 'block' }}>Branch</label>
                                <input value={bank.branchName} onChange={e => setBank({ ...bank, branchName: e.target.value })} placeholder="Main Branch" style={inputStyle} />
                            </div>
                            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveBank} style={{ gridColumn: 'span 2', padding: '12px', background: 'linear-gradient(135deg, #f5d061, #d4af37)', color: '#0a1128', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)' }}>Save Bank Details</motion.button>
                        </div>
                    ) : (
                        <div style={{ padding: '16px', borderRadius: '12px', background: '#0e1838', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                            {bank.accountNumber ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{bank.accountHolderName}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f5d061', fontSize: '11px', fontWeight: 800 }}>
                                            <VerifiedIcon sx={{ fontSize: 14, color: '#f5d061' }} /> Verified for Deposit Returns
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        {bank.bankName} • {bank.accountNumber.replace(/.(?=.{4})/g, '•')}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                        IFSC Code: {bank.ifscCode} | {bank.branchName}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                    <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '10px' }}>No bank account added for security deposit refunds.</p>
                                    <button onClick={() => setBankEditing(true)} style={{
                                        padding: '10px 24px', borderRadius: '20px', background: 'linear-gradient(135deg, #f5d061 0%, #d4af37 100%)', color: '#0a1128',
                                        border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                                    }}>Add Refund Bank Account</button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
