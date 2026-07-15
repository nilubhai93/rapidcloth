import 'dotenv/config';
import mongoose from 'mongoose';

async function create() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionapp', { dbName: 'fashionapp' });
    const db = mongoose.connection.db;
    
    // Check if collection already exists
    const collections = await db.listCollections({ name: 'userMetricsInfo' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('userMetricsInfo');
      console.log("✅ Collection 'userMetricsInfo' created successfully in database 'fashionapp'");
    } else {
      console.log("ℹ️ Collection 'userMetricsInfo' already exists in database 'fashionapp'");
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating collection:', err.message);
    process.exit(1);
  }
}

create();
