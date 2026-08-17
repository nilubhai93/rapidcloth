import { motion } from 'framer-motion';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import ElectricBoltIcon from '@mui/icons-material/ElectricBoltRounded';

export default function DeliveryOffers() {
  const offers = [
    { id: 1, title: 'Downtown Peak Pay', amount: '+$2.50', desc: 'Extra per delivery in downtown area.', time: 'Active until 8:00 PM', type: 'peak' },
    { id: 2, title: 'Weekend Quest', amount: '$50 Bonus', desc: 'Complete 25 deliveries between Fri-Sun.', time: 'Expires in 2 days', type: 'quest' },
    { id: 3, title: 'Rain Boost', amount: '+1.5x Fare', desc: 'Surge pricing due to bad weather conditions.', time: 'Active now', type: 'surge' },
  ];

  const getIcon = (type) => {
    if (type === 'peak') return <ElectricBoltIcon sx={{ color: '#f59e0b', fontSize: '28px' }} />;
    if (type === 'surge') return <ElectricBoltIcon sx={{ color: '#3b82f6', fontSize: '28px' }} />;
    return <LocalOfferIcon sx={{ color: '#10b981', fontSize: '28px' }} />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '80px', maxWidth: '640px', margin: '0 auto', padding: '8px 8px 80px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
        Offers & Quests
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '11px', fontWeight: 500 }}>
        Complete these offers to maximize your earnings.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {offers.map(offer => (
          <motion.div 
            key={offer.id}
            whileHover={{ y: -2 }}
            style={{
              background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(18,18,28,0) 100%)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background design */}
            <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.08 }}>
               <DirectionsBikeIcon sx={{ fontSize: '100px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon(offer.type)}
              </div>
              <div style={{ background: 'rgba(41,255,198,0.1)', color: '#29ffc6', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '12px' }}>
                {offer.amount}
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{offer.title}</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{offer.desc}</p>
            
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{offer.time}</span>
              <button style={{ background: 'transparent', border: 'none', color: '#29ffc6', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>View Details</button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
