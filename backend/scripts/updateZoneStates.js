import 'dotenv/config';
import mongoose from 'mongoose';
import Zone from '../src/models/Zone.js';

const seedZonesWithState = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('Connected to MongoDB');

    // Update existing zones without state or with empty state
    await Zone.updateMany(
      { $or: [{ state: { $exists: false } }, { state: '' }, { state: null }] },
      { $set: { state: 'West Bengal' } }
    );

    // Ensure sample zones for major states exist so partners across states can select their zone
    const defaultZones = [
      {
        name: 'Barrackpore Zone',
        code: 'BRCK-01',
        zoneId: 'ZONE-WB-01',
        city: 'Barrackpore',
        state: 'West Bengal',
        pincodes: ['700120', '700121', '700122', '700123'],
        description: 'Barrackpore municipal and railway hub area',
        status: 'active',
        coordinates: { lat: 22.7675, lng: 88.3671, radiusKm: 6 }
      },
      {
        name: 'Kolkata Central Zone',
        code: 'KOL-01',
        zoneId: 'ZONE-WB-02',
        city: 'Kolkata',
        state: 'West Bengal',
        pincodes: ['700001', '700016', '700019', '700020'],
        description: 'Park Street, Esplanade & South Kolkata central quick delivery zone',
        status: 'active',
        coordinates: { lat: 22.5550, lng: 88.3520, radiusKm: 8 }
      },
      {
        name: 'South Mumbai Central',
        code: 'MUM-01',
        zoneId: 'ZONE-MH-01',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincodes: ['400001', '400005', '400020', '400021'],
        description: 'Colaba, Fort, Marine Drive & Nariman Point delivery corridor',
        status: 'active',
        coordinates: { lat: 18.9220, lng: 72.8347, radiusKm: 6 }
      },
      {
        name: 'Bandra & BKC Express',
        code: 'MUM-02',
        zoneId: 'ZONE-MH-02',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincodes: ['400050', '400051', '400052'],
        description: 'Bandra West, BKC & Santacruz fashion hubs',
        status: 'active',
        coordinates: { lat: 19.0596, lng: 72.8295, radiusKm: 5 }
      },
      {
        name: 'Indiranagar & Koramangala Hub',
        code: 'BLR-01',
        zoneId: 'ZONE-KA-01',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincodes: ['560034', '560038', '560008', '560095'],
        description: 'Prime 10-minute quick delivery zone covering East & South Bengaluru',
        status: 'active',
        coordinates: { lat: 12.9716, lng: 77.5946, radiusKm: 7 }
      },
      {
        name: 'South Delhi Connaught & Saket',
        code: 'DEL-01',
        zoneId: 'ZONE-DL-01',
        city: 'New Delhi',
        state: 'Delhi',
        pincodes: ['110001', '110017', '110024', '110048'],
        description: 'Connaught Place, Greater Kailash, Saket express delivery hub',
        status: 'active',
        coordinates: { lat: 28.6139, lng: 77.2090, radiusKm: 8 }
      }
    ];

    for (const z of defaultZones) {
      const exists = await Zone.findOne({ $or: [{ code: z.code }, { name: z.name }] });
      if (!exists) {
        await Zone.create(z);
        console.log(`Created zone: ${z.name} (${z.state})`);
      } else {
        if (!exists.state) {
          exists.state = z.state;
          await exists.save();
        }
      }
    }

    const zones = await Zone.find({}, 'name code city state status');
    console.log('Final zones in DB:', zones);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error updating zones:', err);
    process.exit(1);
  }
};

seedZonesWithState();
