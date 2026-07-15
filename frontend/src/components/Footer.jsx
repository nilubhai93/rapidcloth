import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import HomeOutlinedIcon from '@mui/icons-material/HomeRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import ReplayIcon from '@mui/icons-material/ReplayRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondRounded';
import DiamondIcon from '@mui/icons-material/DiamondRounded';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { language, t } = useLanguage();

  const tabs = [
    {
      id: 'home',
      label: t('navbar.home'),
      path: '/shop',
      icon: HomeOutlinedIcon,
      activeIcon: HomeIcon,
      match: (p) => p === '/shop'
    },
    {
      id: 'buyagain',
      label: t('navbar.buyAgain'),
      path: '/orders',
      icon: ReplayIcon,
      activeIcon: ReplayIcon,
      match: (p) => p === '/orders'
    },
    {
      id: 'bucket',
      label: t('navbar.bucket'),
      path: '/cart',
      icon: ShoppingBagOutlinedIcon,
      activeIcon: ShoppingBagIcon,
      badge: itemCount,
      match: (p) => p === '/cart'
    },
    {
      id: 'categories',
      label: t('navbar.categories'),
      path: '/products',
      icon: CategoryOutlinedIcon,
      activeIcon: CategoryIcon,
      match: (p) => p === '/products' || p.startsWith('/products?')
    },
    {
      id: 'rent',
      label: t('navbar.rent'),
      path: '/rent',
      icon: DiamondOutlinedIcon,
      activeIcon: DiamondIcon,
      upcoming: true,
      match: (p) => p === '/rent'
    }
  ];

  const isActive = (tab) => tab.match(location.pathname);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  if (isLandingPage || isAuthPage) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed footer */}
      <div id="bottom-nav-spacer" style={{ height: '80px' }} />

      <nav
        id="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '0 4px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '560px',
          margin: '0 auto',
          height: '64px',
        }}>
          {tabs.map((tab) => {
            const active = isActive(tab);
            const IconComp = active ? tab.activeIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  padding: '8px 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  minWidth: '64px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Icon wrapper */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp
                    sx={{
                      fontSize: '24px',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    }}
                  />

                  {/* Cart badge */}
                  {tab.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#ff5722',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                        border: '2px solid #0a0a0a'
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}

                  {/* Upcoming "NEW" badge */}
                  {tab.upcoming && (
                    <span style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-20px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#ff5722',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      NEW
                    </span>
                  )}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  marginTop: '2px',
                  letterSpacing: '0.3px',
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Footer */}
      <div id="desktop-footer" style={{ background: '#232f3e', color: 'white', marginTop: '0px', fontFamily: 'Arial, sans-serif' }}>
        {/* Back to top */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: '#37475a', padding: '15px 0', textAlign: 'center', cursor: 'pointer', fontSize: '13px' }}
        >
          {t('footer.backToTop')}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px', borderBottom: '1px solid #3a4553' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '60px', maxWidth: '1000px', width: '100%' }}>
            {/* Column 1 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>{t('footer.getToKnowUs')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="#" className="footer-link">{t('footer.aboutRapidCloth')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.careers')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.pressReleases')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.rapidClothScience')}</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>{t('footer.connectWithUs')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="#" className="footer-link">{t('footer.facebook')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.twitter')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.instagram')}</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>{t('footer.makeMoney')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/become-seller" className="footer-link">{t('footer.sellOn')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.protectBuildBrand')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.globalSelling')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.supplyTo')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.becomeAffiliate')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.fulfillment')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.advertise')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.payOnMerchants')}</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>{t('footer.helpUs')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/profile" className="footer-link">{t('footer.yourAccount')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.returnsCentre')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.recallsAlerts')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.purchaseProtection')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.appDownload')}</Link></li>
                <li><Link to="#" className="footer-link">{t('footer.help')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '30px 20px' }}>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '28px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>R</div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: 'white' }}>rapidCloth</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ border: '1px solid #848688', padding: '6px 10px', borderRadius: '3px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <span style={{ fontSize: '16px' }}>🌐</span> {language === 'EN' ? 'English' : language === 'HI' ? 'Hindi' : language === 'BN' ? 'Bengali' : 'Marathi'} <span style={{ fontSize: '10px' }}>▼</span>
            </div>
            <div style={{ border: '1px solid #848688', padding: '6px 10px', borderRadius: '3px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India Flag" style={{ width: '16px' }} /> India
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          #bottom-nav, #bottom-nav-spacer {
            display: none !important;
          }
          #desktop-footer {
            display: block !important;
          }
          .footer-link {
            color: #ddd;
            text-decoration: none;
            transition: color 0.2s;
          }
          .footer-link:hover {
            text-decoration: underline;
            color: white;
          }
        }
        @media (max-width: 767px) {
          #desktop-footer {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
