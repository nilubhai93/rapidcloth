import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const updateOccasions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const occasions = ['wedding', 'party', 'office', 'date-night', 'beach', 'gym', 'graduation', 'festival'];
    
    const products = await Product.find({});
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      process.exit(0);
    }
    
    let updatedCount = 0;
    
    // Randomly assign occasion to products without one
    for (let product of products) {
      if (!product.occasion || product.occasion.length === 0) {
        const randomOccasion1 = occasions[Math.floor(Math.random() * occasions.length)];
        product.occasion = [randomOccasion1];
        await product.save();
        updatedCount++;
      }
    }
    
    // Ensure every occasion has at least 3 products
    for (let occasion of occasions) {
      const occasionProducts = await Product.find({ occasion: occasion });
      if (occasionProducts.length < 3) {
        const need = 3 - occasionProducts.length;
        // find some products that don't have this occasion and add it
        const randomProducts = await Product.aggregate([
          { $match: { occasion: { $ne: occasion } } },
          { $sample: { size: need } }
        ]);
        
        for (let p of randomProducts) {
          await Product.findByIdAndUpdate(p._id, { $addToSet: { occasion: occasion } });
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully assigned occasions to products. Updated ${updatedCount} times.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateOccasions();
