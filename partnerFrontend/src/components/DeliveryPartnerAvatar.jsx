import React from 'react';
import partnerHeroImg from '../assets/delivery_partner_hero.png';

export default function DeliveryPartnerAvatar({ width = 240, height = 200, className = "" }) {
  return (
    <div className={`delivery-partner-avatar-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <img
        src={partnerHeroImg}
        alt="Delivery Partner"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.45))',
          borderRadius: '20px'
        }}
      />
    </div>
  );
}
