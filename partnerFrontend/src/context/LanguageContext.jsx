import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    feed: 'Home / Feed',
    earnings: 'Earnings',
    shifts: 'My Shifts',
    orders: 'My Orders',
    more: 'More',
    moreFeatures: 'All Features & Links',
    quickAccess: 'Quick access to all delivery services',
    profile: 'Profile',
    myProfile: 'My Profile',
    history: 'History',
    notifications: 'Notifications',
    support: 'Help & Support',
    refer: 'Refer & Earn',
    emergency: 'Emergency Safety',
    offers: 'Offers & Quests',
    market: 'Rapid Store',
    signOut: 'Sign Out',
    logOut: 'Log out',
    dashboard: 'Dashboard',

    // Profile Screen
    profileTitle: 'Profile',
    yourRatings: 'Your ratings',
    mobileNumber: 'Mobile number',
    joiningDate: 'Joining date',
    city: 'City',
    zone: 'Zone',
    orderCategory: 'Order Category',
    insuranceDetails: 'Insurance details',
    insuranceSubtitle: 'Active 7-Day Cover ✓',
    emergencyDetails: 'Emergency details',
    emergencySubtitle: '1 Contact Registered',
    bankDetails: 'Bank details',
    appLanguage: 'App language',
    preferredLanguage: 'Preferred Language',
    selectLanguage: 'Select Language',
    edit: 'Edit',

    // Earnings Screen
    weeklyEarnings: 'YOUR WEEKLY EARNINGS',
    offerZone: 'Offer zone',
    payouts: 'Payouts',
    codCashBalance: 'COD Cash Collected',
    remitCash: 'Remit Cash',
    weeklyHistory: 'WEEKLY EARNINGS HISTORY',
    allDetails: 'All Details',
    letsDeliver: "Let's deliver",
    firstOrderMsg: 'our first order of the week!',
    firstOrderBadge: '1st ORDER',

    // Refer Screen
    earnUpto: 'Earn upto',
    forEveryReferral: 'For every referral',
    seeHighBonusZones: 'SEE HIGH BONUS ZONES',
    referYourFriend: 'REFER YOUR FRIEND',
    contactNumber: 'Contact number',
    contactName: 'Contact name',
    friendCity: "Friend's city name",
    referNow: 'Refer Now',
    yourReferrals: 'YOUR REFERRALS',
    noReferrals: 'No referrals to show',
    referIn3Steps: 'Refer in 3 simple steps',
    step1: "Enter your friend's details",
    step2: 'Complete the Target',
    step3: 'Enjoy the bonus',
    referEarnNow: 'Refer & Earn now',

    // Misc
    activeCover: 'Active Cover',
    help: 'Help',
    settings: 'Settings'
  },

  hi: {
    // Navigation
    home: 'होम',
    feed: 'मुख्य पृष्ठ / फीड',
    earnings: 'कमाई',
    shifts: 'मेरी शिफ्ट्स',
    orders: 'मेरे ऑर्डर',
    more: 'और',
    moreFeatures: 'सभी सुविधाएं और लिंक',
    quickAccess: 'सभी डिलीवरी सेवाओं तक त्वरित पहुंच',
    profile: 'प्रोफ़ाइल',
    myProfile: 'मेरी प्रोफ़ाइल',
    history: 'इतिहास',
    notifications: 'सूचनाएं',
    support: 'सहायता और समर्थन',
    refer: 'रेफ़र करें और कमाएं',
    emergency: 'आपातकालीन सुरक्षा',
    offers: 'ऑफ़र और क्वैस्ट',
    market: 'रैपिड स्टोर',
    signOut: 'साइन आउट',
    logOut: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',

    // Profile Screen
    profileTitle: 'प्रोफ़ाइल',
    yourRatings: 'आपकी रेटिंग',
    mobileNumber: 'मोबाइल नंबर',
    joiningDate: 'शामिल होने की तिथि',
    city: 'शहर',
    zone: 'ज़ोन',
    orderCategory: 'ऑर्डर श्रेणी',
    insuranceDetails: 'बीमा विवरण',
    insuranceSubtitle: 'सक्रिय 7-दिवसीय कवर ✓',
    emergencyDetails: 'आपातकालीन विवरण',
    emergencySubtitle: '1 संपर्क पंजीकृत',
    bankDetails: 'बैंक विवरण',
    appLanguage: 'ऐप की भाषा',
    preferredLanguage: 'पसंदीदा भाषा',
    selectLanguage: 'भाषा चुनें',
    edit: 'संपादित करें',

    // Earnings Screen
    weeklyEarnings: 'आपकी साप्ताहिक कमाई',
    offerZone: 'ऑफ़र ज़ोन',
    payouts: 'पेआउट',
    codCashBalance: 'एकत्रित सीओडी कैश',
    remitCash: 'कैश जमा करें',
    weeklyHistory: 'साप्ताहिक कमाई का इतिहास',
    allDetails: 'सभी विवरण',
    letsDeliver: 'आइए डिलीवर करें',
    firstOrderMsg: 'सप्ताह का अपना पहला ऑर्डर!',
    firstOrderBadge: 'पहला ऑर्डर',

    // Refer Screen
    earnUpto: 'तक कमाएं',
    forEveryReferral: 'प्रत्येक रेफ़रल पर',
    seeHighBonusZones: 'उच्च बोनस ज़ोन देखें',
    referYourFriend: 'अपने मित्र को रेफ़र करें',
    contactNumber: 'संपर्क नंबर',
    contactName: 'संपर्क नाम',
    friendCity: 'मित्र के शहर का नाम',
    referNow: 'अभी रेफ़र करें',
    yourReferrals: 'आपके रेफ़रल',
    noReferrals: 'दिखाने के लिए कोई रेफ़रल नहीं',
    referIn3Steps: '3 आसान चरणों में रेफ़र करें',
    step1: 'अपने मित्र का विवरण दर्ज करें',
    step2: 'लक्ष्य पूरा करें',
    step3: 'बोनस का आनंद लें',
    referEarnNow: 'अभी रेफ़र करें और कमाएं',

    // Misc
    activeCover: 'सक्रिय कवर',
    help: 'सहायता',
    settings: 'सेटिंग्स'
  },

  bn: {
    // Navigation
    home: 'হোম',
    feed: 'মূল পাতা / ফিড',
    earnings: 'উপার্জন',
    shifts: 'আমার শিফট',
    orders: 'আমার অর্ডার',
    more: 'আরও',
    moreFeatures: 'সমস্ত বৈশিষ্ট্য এবং লিঙ্ক',
    quickAccess: 'সমস্ত ডেলিভারি পরিষেবাগুলিতে দ্রুত অ্যাক্সেস',
    profile: 'প্রোফাইল',
    myProfile: 'আমার প্রোফাইল',
    history: 'ইতিহাস',
    notifications: 'বিজ্ঞপ্তি',
    support: 'সাহায্য ও সহায়তা',
    refer: 'রেফার করুন এবং উপার্জন করুন',
    emergency: 'জরুরী সুরক্ষা',
    offers: 'অফার এবং কোয়েস্ট',
    market: 'র‍্যাপিড স্টোর',
    signOut: 'সাইন আউট',
    logOut: 'লগ আউট',
    dashboard: 'ড্যাশবোর্ড',

    // Profile Screen
    profileTitle: 'প্রোফাইল',
    yourRatings: 'আপনার রেটিং',
    mobileNumber: 'মোবাইল নম্বর',
    joiningDate: 'যোগদানের তারিখ',
    city: 'শহর',
    zone: 'জোন',
    orderCategory: 'অর্ডার বিভাগ',
    insuranceDetails: 'বীমা বিবরণ',
    insuranceSubtitle: 'সক্রিয় ৭-দিনের কভার ✓',
    emergencyDetails: 'জরুরী বিবরণ',
    emergencySubtitle: '১টি যোগাযোগ নিবন্ধিত',
    bankDetails: 'ব্যাঙ্ক বিবরণ',
    appLanguage: 'অ্যাপের ভাষা',
    preferredLanguage: 'পছন্দের ভাষা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    edit: 'সম্পাদনা করুন',

    // Earnings Screen
    weeklyEarnings: 'আপনার সাপ্তাহিক উপার্জন',
    offerZone: 'অফার জোন',
    payouts: 'পেআউট',
    codCashBalance: 'সংগৃহীত সিওডি ক্যাশ',
    remitCash: 'ক্যাশ জমা দিন',
    weeklyHistory: 'সাপ্তাহিক উপার্জনের ইতিহাস',
    allDetails: 'সমস্ত বিবরণ',
    letsDeliver: 'আসুন ডেলিভারি করি',
    firstOrderMsg: 'সপ্তাহের আমাদের প্রথম অর্ডার!',
    firstOrderBadge: '১ম অর্ডার',

    // Refer Screen
    earnUpto: 'পর্যন্ত আয় করুন',
    forEveryReferral: 'প্রতিটি রেফারে',
    seeHighBonusZones: 'হাই বোনাস জোন দেখুন',
    referYourFriend: 'আপনার বন্ধুকে রেফার করুন',
    contactNumber: 'যোগাযোগ নম্বর',
    contactName: 'বন্ধুর নাম',
    friendCity: 'বন্ধুর শহরের নাম',
    referNow: 'এখনই রেফার করুন',
    yourReferrals: 'আপনার রেফারেল',
    noReferrals: 'দেখানোর মতো কোনো রেফারেল নেই',
    referIn3Steps: '৩টি সহজ পদক্ষেপে রেফার করুন',
    step1: 'আপনার বন্ধুর বিবরণ দিন',
    step2: 'টার্গেট পূরণ করুন',
    step3: 'বোনাস উপভোগ করুন',
    referEarnNow: 'এখনই রেফার করুন ও আয় করুন',

    // Misc
    activeCover: 'সক্রিয় কভার',
    help: 'সাহায্য',
    settings: 'সেটিংস'
  },

  ta: {
    // Navigation
    home: 'முகப்பு',
    feed: 'முகப்பு / ஊட்டம்',
    earnings: 'வருமானம்',
    shifts: 'என் ஷிஃப்டுகள்',
    orders: 'என் ஆர்டர்கள்',
    more: 'மேலும்',
    moreFeatures: 'அனைத்து அம்சங்கள் & இணைப்புகள்',
    quickAccess: 'அனைத்து சேவைகளுக்கும் விரைவு அணுகல்',
    profile: 'சுயவிவரம்',
    myProfile: 'என் சுயவிவரம்',
    history: 'வரலாறு',
    notifications: 'அறிவிப்புகள்',
    support: 'உதவி & ஆதரவு',
    refer: 'பரிந்துரைத்து சம்பாதிக்க',
    emergency: 'அவசர பாதுகாப்பு',
    offers: 'சலுகைகள்',
    market: 'ரேபிட் ஸ்டோர்',
    signOut: 'வெளியேறு',
    logOut: 'லாக் அவுட்',
    dashboard: 'டாஷ்போர்டு',

    // Profile Screen
    profileTitle: 'சுயவிவரம்',
    yourRatings: 'உங்கள் மதிப்பீடு',
    mobileNumber: 'மொபைல் எண்',
    joiningDate: 'சேர்ந்த தேதி',
    city: 'நகரம்',
    zone: 'மண்டலம்',
    orderCategory: 'ஆர்டர் வகை',
    insuranceDetails: 'காப்பீட்டு விவரங்கள்',
    insuranceSubtitle: 'செயலில் உள்ள 7-நாள் கவர் ✓',
    emergencyDetails: 'அவசர விவரங்கள்',
    emergencySubtitle: '1 தொடர்பு பதிவு செய்யப்பட்டுள்ளது',
    bankDetails: 'வங்கி விவரங்கள்',
    appLanguage: 'பயன்பாட்டு மொழி',
    preferredLanguage: 'விருப்ப மொழி',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    edit: 'திருத்து',

    // Earnings Screen
    weeklyEarnings: 'உங்கள் வாராந்திர வருமானம்',
    offerZone: 'சலுகை மண்டலம்',
    payouts: 'பணம் செலுத்துதல்',
    codCashBalance: 'சேகரிக்கப்பட்ட பணம்',
    remitCash: 'பணம் செலுத்துங்கள்',
    weeklyHistory: 'வாராந்திர வருமான வரலாறு',
    allDetails: 'அனைத்து விவரங்களும்',
    letsDeliver: 'வழங்குவோம்',
    firstOrderMsg: 'வாரத்தின் நமது முதல் ஆர்டர்!',
    firstOrderBadge: 'முதல் ஆர்டர்',

    // Refer Screen
    earnUpto: 'வரை சம்பாதிக்கவும்',
    forEveryReferral: 'ஒவ்வொரு பரிந்துரைக்கும்',
    seeHighBonusZones: 'உயர் போனஸ் மண்டலங்களைப் பார்க்கவும்',
    referYourFriend: 'உங்கள் நண்பரைப் பரிந்துரைக்கவும்',
    contactNumber: 'தொடர்பு எண்',
    contactName: 'நண்பரின் பெயர்',
    friendCity: 'நண்பரின் நகரம்',
    referNow: 'இப்போது பரிந்துரைக்கவும்',
    yourReferrals: 'உங்கள் பரிந்துரைகள்',
    noReferrals: 'காண்பிக்க பரிந்துரைகள் இல்லை',
    referIn3Steps: '3 எளிய படிகளில் பரிந்துரைக்கவும்',
    step1: 'நண்பரின் விவரங்களை உள்ளிடவும்',
    step2: 'இலக்கை முடிக்கவும்',
    step3: 'போனஸை அனுபவிக்கவும்',
    referEarnNow: 'இப்போது பரிந்துரைத்து சம்பாதிக்கவும்',

    // Misc
    activeCover: 'செயலில் உள்ள கவர்',
    help: 'உதவி',
    settings: 'அமைப்புகள்'
  },

  te: {
    // Navigation
    home: 'హోమ్',
    feed: 'హోమ్ / ఫీడ్',
    earnings: 'సంపాదన',
    shifts: 'నా షిఫ్ట్‌లు',
    orders: 'నా ఆర్డర్‌లు',
    more: 'మరిన్ని',
    moreFeatures: 'అన్ని ఫీచర్లు & లింక్‌లు',
    quickAccess: 'అన్ని సేవలకు శీఘ్ర ప్రవేశం',
    profile: 'ప్రొఫైల్',
    myProfile: 'నా ప్రొఫైల్',
    history: 'చరిత్ర',
    notifications: 'నోటిఫికేషన్‌లు',
    support: 'సహాయం & మద్దతు',
    refer: 'రెఫర్ చేసి సంపాదించండి',
    emergency: 'అత్యవసర భద్రత',
    offers: 'ఆఫర్‌లు',
    market: 'రాపిడ్ స్టోర్',
    signOut: 'సైన్ అవుట్',
    logOut: 'లాగ్ అవుట్',
    dashboard: 'డాష్‌బోర్డ్',

    // Profile Screen
    profileTitle: 'ప్రొఫైల్',
    yourRatings: 'మీ రేటింగ్‌లు',
    mobileNumber: 'మొబైల్ సంఖ్య',
    joiningDate: 'చేరిన తేదీ',
    city: 'నగరం',
    zone: 'జోన్',
    orderCategory: 'ఆర్డర్ వర్గం',
    insuranceDetails: 'బీమా వివరాలు',
    insuranceSubtitle: 'యాక్టివ్ 7-రోజుల కవర్ ✓',
    emergencyDetails: 'అత్యవసర వివరాలు',
    emergencySubtitle: '1 కాంటాక్ట్ నమోదైంది',
    bankDetails: 'బ్యాంకు వివరాలు',
    appLanguage: 'యాప్ భాష',
    preferredLanguage: 'ప్రాధాన్యత కలిగిన భాష',
    selectLanguage: 'భాషను ఎంచుకోండి',
    edit: 'సవరించు',

    // Earnings Screen
    weeklyEarnings: 'మీ వారపు సంపాదన',
    offerZone: 'ఆఫర్ జోన్',
    payouts: 'పేఅవుట్‌లు',
    codCashBalance: 'సేకరించిన క్యాష్',
    remitCash: 'క్యాష్ సమర్పించండి',
    weeklyHistory: 'వారపు సంపాదన చరిత్ర',
    allDetails: 'అన్ని వివరాలు',
    letsDeliver: 'డెలివరీ చేద్దాం',
    firstOrderMsg: 'వారంలో మన మొదటి ఆర్డర్!',
    firstOrderBadge: 'మొదటి ఆర్డర్',

    // Refer Screen
    earnUpto: 'వరకు సంపాదించండి',
    forEveryReferral: 'ప్రతి రెఫరల్‌కు',
    seeHighBonusZones: 'హై బోనస్ జోన్‌లను చూడండి',
    referYourFriend: 'మీ స్నేహితుడిని రెఫర్ చేయండి',
    contactNumber: 'కాంటాక్ట్ నంబర్',
    contactName: 'స్నేహితుడి పేరు',
    friendCity: 'స్నేహితుడి నగరం',
    referNow: 'ఇప్పుడే రెఫర్ చేయండి',
    yourReferrals: 'మీ రెఫరల్స్',
    noReferrals: 'చూపించడానికి రెఫరల్స్ లేవు',
    referIn3Steps: '3 సులభమైన దశల్లో రెఫర్ చేయండి',
    step1: 'స్నేహితుడి వివరాలను ఎంటర్ చేయండి',
    step2: 'టార్గెట్‌ను పూర్తి చేయండి',
    step3: 'బోనస్‌ను ఆస్వాదించండి',
    referEarnNow: 'ఇప్పుడే రెఫర్ చేసి సంపాదించండి',

    // Misc
    activeCover: 'యాక్టివ్ కవర్',
    help: 'సహాయం',
    settings: 'సెట్టింగ్‌లు'
  }
};

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem('partner_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('partner_language', langCode);
  }, [langCode]);

  const t = (key) => {
    const currentDict = translations[langCode] || translations.en;
    return currentDict[key] || translations.en[key] || key;
  };

  const changeLanguage = (newCode) => {
    if (translations[newCode]) {
      setLangCode(newCode);
    }
  };

  return (
    <LanguageContext.Provider value={{ langCode, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
