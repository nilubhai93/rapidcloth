import 'dotenv/config';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Zone from '../models/Zone.js';

const seedSuperAdminAndZones = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to MongoDB for seeding...');

    // 1. Seed or update Superadmin account
    let superAdmin = await User.findOne({ email: 'superadmin@rapidcloth.com' });
    if (!superAdmin) {
      superAdmin = new User({
        name: 'RapidCloth SuperAdmin',
        email: 'superadmin@rapidcloth.com',
        password: 'SuperAdmin@123',
        phone: '9999999999',
        role: 'superadmin'
      });
      await superAdmin.save();
      console.log('✅ Superadmin created: superadmin@rapidcloth.com / SuperAdmin@123');
    } else {
      superAdmin.role = 'superadmin';
      superAdmin.password = 'SuperAdmin@123';
      await superAdmin.save();
      console.log('✅ Superadmin user verified and password set to SuperAdmin@123.');
    }

    // 2. Remove dummy seeded sellers/riders if present
    const removedCount = await User.deleteMany({
      email: {
        $in: [
          'seller.mumbai1@rapidcloth.com',
          'seller.bandra@rapidcloth.com',
          'seller.mumbai2@rapidcloth.com',
          'rider.mumbai1@rapidcloth.com',
          'rider.bandra@rapidcloth.com'
        ]
      }
    });
    if (removedCount.deletedCount > 0) {
      console.log(`🧹 Removed ${removedCount.deletedCount} dummy seeded seller/rider accounts.`);
    }

    // 3. Ensure default operational zones exist with Map Geofence Coordinates & Readable Zone IDs
    let zone1 = await Zone.findOne({ code: 'ZM-MUM-01' });
    if (!zone1) {
      zone1 = new Zone({
        name: 'South Mumbai Central',
        zoneId: 'ZONE-101',
        code: 'ZM-MUM-01',
        city: 'Mumbai',
        pincodes: ['400001', '400002', '400003', '400020', '400021'],
        description: 'Primary high-density quick-commerce fashion zone covering Colaba, Fort, Marine Drive.',
        status: 'active',
        coordinates: { lat: 18.9220, lng: 72.8347, radiusKm: 4 }
      });
      await zone1.save();
    } else if (!zone1.coordinates || !zone1.coordinates.lat) {
      zone1.coordinates = { lat: 18.9220, lng: 72.8347, radiusKm: 4 };
      if (!zone1.zoneId) zone1.zoneId = 'ZONE-101';
      await zone1.save();
    }

    let zone2 = await Zone.findOne({ code: 'ZM-MUM-02' });
    if (!zone2) {
      zone2 = new Zone({
        name: 'Bandra & Suburban West',
        zoneId: 'ZONE-102',
        code: 'ZM-MUM-02',
        city: 'Mumbai',
        pincodes: ['400050', '400051', '400052', '400053'],
        description: 'Bandra West, Khar, and Santacruz fashion distribution hub.',
        status: 'active',
        coordinates: { lat: 19.0596, lng: 72.8295, radiusKm: 5 }
      });
      await zone2.save();
    } else if (!zone2.coordinates || !zone2.coordinates.lat) {
      zone2.coordinates = { lat: 19.0596, lng: 72.8295, radiusKm: 5 };
      if (!zone2.zoneId) zone2.zoneId = 'ZONE-102';
      await zone2.save();
    }

    console.log('\n🎉 Superadmin & Zone Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedSuperAdminAndZones();
