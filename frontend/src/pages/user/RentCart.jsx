import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import RentNavbar from '../../components/RentNavbar';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import AutorenewIcon from '@mui/icons-material/AutorenewRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';

export default function RentCart() {
    const { items, updateItem, removeItem, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Filter ONLY rental items
    const rentalItems = items.filter(item => item.isRental);

    const calculateSubtotal = () => {
        return rentalItems.reduce((sum, item) => {
            const pricePerDay = item.product?.rentPricePerDay || 0;
            const days = item.rentalDays || 3;
            return sum + (pricePerDay * days * item.quantity);
        }, 0);
    };

    const calculateSecurityDeposit = () => {
        // Standard refundable deposit per unique item
        return rentalItems.reduce((sum, item) => sum + (1500 * item.quantity), 0);
    };

    const subtotal = calculateSubtotal();
    const deposit = calculateSecurityDeposit();
    const deliveryFee = subtotal > 1500 ? 0 : 150;
    const platformFee = rentalItems.length > 0 ? 10 : 0;
    const total = subtotal + deposit + deliveryFee + platformFee;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/register?redirect=/rent/cart');
        } else {
            navigate('/checkout?type=rent');
        }
    };

    if (rentalItems.length === 0) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafb', fontFamily: 'var(--font-sans)' }}>
                <RentNavbar activeTab="rent" />
                <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '40px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>👗</div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
                            Your Rental Bag is Empty
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px' }}>
                            You haven't added any luxury rental outfits yet. Explore our designer collection!
                        </p>
                        <button
                            onClick={() => navigate('/rent')}
                            style={{
                                padding: '14px 32px',
                                borderRadius: '30px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            Start Renting
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fafafb', fontFamily: 'var(--font-sans)' }}>
            <RentNavbar activeTab="rent" />

            <div className="container" style={{ padding: '32px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                        Rental Bag <span style={{ color: '#64748b', fontSize: '16px', fontWeight: 400 }}>({rentalItems.length} items)</span>
                    </h1>
                    <button
                        onClick={clearCart}
                        style={{
                            color: '#64748b',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: '18px' }} /> Clear Bag
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
                    {/* List of items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <AnimatePresence>
                            {rentalItems.map(item => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    exit={{ opacity: 0, x: -100 }}
                                    style={{
                                        display: 'flex',
                                        gap: '20px',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <Link to={`/products/${item.product?._id}`}>
                                        <img
                                            src={item.product?.images?.[0] || 'https://placehold.co/100x120?text=No+Image'}
                                            alt={item.product?.name}
                                            style={{ width: '100px', height: '125px', borderRadius: '12px', objectFit: 'cover' }}
                                        />
                                    </Link>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {item.product?.brand || 'Premium Collection'}
                                            </div>
                                            <Link to={`/products/${item.product?._id}`} style={{ textDecoration: 'none' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '4px', marginBottom: '8px' }}>
                                                    {item.product?.name}
                                                </h3>
                                            </Link>
                                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                                                <span>Size: <strong style={{ color: '#0f172a' }}>{item.size}</strong></span>
                                                {item.color && <span>Color: <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{item.color}</strong></span>}
                                                <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5', fontSize: '12px', fontWeight: 700 }}>
                                                    Rent · {item.rentalDays || 3} Days
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button
                                                    onClick={() => updateItem(item._id, item.quantity - 1)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <RemoveIcon sx={{ fontSize: '16px' }} />
                                                </button>
                                                <span style={{ fontWeight: 700, fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateItem(item._id, item.quantity + 1)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <AddIcon sx={{ fontSize: '16px' }} />
                                                </button>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>
                                                    ₹{((item.product?.rentPricePerDay || 0) * (item.rentalDays || 3) * item.quantity).toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                    {item.quantity} × {item.rentalDays || 3}d × ₹{item.product?.rentPricePerDay || 0}/day
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item._id)}
                                        style={{ alignSelf: 'flex-start', color: '#94a3b8', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: '22px' }} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary side block */}
                    <div style={{ position: 'sticky', top: '96px' }}>
                        <div style={{ padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>Rental Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>Rent Subtotal</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#64748b' }}>Refundable Deposit</span>
                                        <span style={{ fontSize: '11px', color: '#10b981' }}>Fully refunded on return</span>
                                    </div>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{deposit.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>Dry Cleaning & Delivery</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>Platform Fee</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{platformFee}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
                                <span style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5' }}>₹{total.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #111827 0%, #312e81 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(17, 24, 39, 0.2)'
                                }}
                            >
                                Book Rental Outfits
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '16px', color: '#10b981', fontWeight: 600 }}>
                                <VerifiedUserIcon sx={{ fontSize: '16px' }} />
                                <span>Sanitized & dry-cleaned guarantee</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                            <AccessTimeIcon sx={{ color: '#6366f1', fontSize: '20px', flexShrink: 0 }} />
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Hassle-Free Return Delivery</h4>
                                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                                    No need to wash! A courier partner will pick up the outfit directly from your shipping address on the final rental day.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
