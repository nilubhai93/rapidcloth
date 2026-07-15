import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function seedDelivery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('✅ Connected to MongoDB');

    const deliveryPartners = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.delivery@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'delivery',
        deliveryProfile: {
          isOnline: true,
          vehicleNumber: 'MH01AB1234',
          vehicleType: 'Bike',
          totalEarnings: 4500
        }
      },
      {
        name: 'Amit Patel',
        email: 'amit.delivery@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'delivery',
        deliveryProfile: {
          isOnline: false,
          vehicleNumber: 'MH02CD5678',
          vehicleType: 'Scooter',
          totalEarnings: 3200
        }
      },
      {
        name: 'Suresh Kumar',
        email: 'suresh.delivery@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'delivery',
        deliveryProfile: {
          isOnline: true,
          vehicleNumber: 'MH03EF9012',
          vehicleType: 'Bike',
          totalEarnings: 5800
        }
      }
    ];

    for (const partner of deliveryPartners) {
      const exists = await User.findOne({ email: partner.email });
      if (!exists) {
        await User.create(partner);
        console.log(`👤 Created delivery partner: ${partner.name}`);
      } else {
        console.log(`ℹ️ Delivery partner ${partner.name} already exists`);
      }
    }

    console.log('✨ Delivery partners seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDelivery();
