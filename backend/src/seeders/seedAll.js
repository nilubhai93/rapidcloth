import 'dotenv/config';
import mongoose from 'mongoose';
import axios from 'axios';
import Product from '../models/Product.js';
import SizeMapping from '../models/SizeMapping.js';
import AssociationRule from '../models/AssociationRule.js';
import User from '../models/User.js';

const rawProducts = [
  // === WEDDING GUEST ===
  { name: 'Elegant Evening Gown', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 4999, discountPrice: 2999, discountPercent: 40, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }, { size: 'XXL', stock: 3 }], tags: ['formal', 'wedding'], occasion: ['Wedding Guest'], description: 'Stunning evening gown with premium silk fabric, perfect for wedding receptions.', rating: 4.8, reviewCount: 124, images: ['/images/product_dress.png'] },
  { name: 'Royal Embroidered Sherwani', brand: 'LUXÉ Homme', category: 'kurta', gender: 'men', price: 8999, discountPrice: 5999, discountPercent: 33, sizes: [{ size: 'S', stock: 5 }, { size: 'M', stock: 10 }, { size: 'L', stock: 15 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 4 }], tags: ['formal', 'wedding'], occasion: ['Wedding Guest'], description: 'Handcrafted embroidered sherwani for the modern groom and wedding guest.', rating: 4.9, reviewCount: 89, images: ['/images/product_jacket.png'] },
  { name: 'Pastel Chiffon Saree Gown', brand: 'LUXÉ', category: 'saree', gender: 'women', price: 6499, discountPrice: 3999, discountPercent: 38, sizes: [{ size: 'S', stock: 12 }, { size: 'M', stock: 18 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }], tags: ['formal', 'wedding'], occasion: ['Wedding Guest'], description: 'Graceful chiffon saree gown with delicate embellishments for sangeet nights.', rating: 4.7, reviewCount: 67, images: ['/images/product_dress.png'] },
  { name: 'Kids Flower Girl Dress', brand: 'LUXÉ Petit', category: 'frock', gender: 'kids', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'XS', stock: 20 }, { size: 'S', stock: 15 }, { size: 'M', stock: 10 }], tags: ['formal', 'wedding'], occasion: ['Wedding Guest'], description: 'Adorable tulle flower girl dress with satin ribbon sash.', rating: 4.6, reviewCount: 45, images: ['/images/product_dress.png'] },

  // === PARTY NIGHT ===
  { name: 'Sequin Bodycon Mini Dress', brand: 'LUXÉ', category: 'dress', gender: 'women', price: 3499, discountPrice: 1999, discountPercent: 43, sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 25 }, { size: 'L', stock: 15 }, { size: 'XL', stock: 8 }], tags: ['party', 'trendy'], occasion: ['Party Night'], description: 'Show-stopping sequin dress that catches every light on the dance floor.', rating: 4.5, reviewCount: 203, images: ['/images/product_dress.png'] },
  { name: 'Velvet Blazer Set', brand: 'LUXÉ Homme', category: 'jacket', gender: 'men', price: 5999, discountPrice: 3499, discountPercent: 42, sizes: [{ size: 'S', stock: 5 }, { size: 'M', stock: 12 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 4 }], tags: ['party', 'formal'], occasion: ['Party Night'], description: 'Luxurious velvet blazer for unforgettable party nights and club events.', rating: 4.6, reviewCount: 156, images: ['/images/product_jacket.png'] },
  { name: 'Metallic Off-Shoulder Top', brand: 'LUXÉ', category: 'top', gender: 'women', price: 1999, sizes: [{ size: 'S', stock: 30 }, { size: 'M', stock: 25 }, { size: 'L', stock: 15 }], tags: ['party', 'trendy'], occasion: ['Party Night'], description: 'Shimmering metallic off-shoulder top for electric party vibes.', rating: 4.3, reviewCount: 98, images: ['/images/product_tshirt.png'] },
  { name: 'Kids Party Sparkle Outfit', brand: 'LUXÉ Petit', category: 'baba-suit', gender: 'kids', price: 1799, discountPrice: 999, discountPercent: 44, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 12 }, { size: 'L', stock: 8 }], tags: ['party'], occasion: ['Party Night'], description: 'Fun sparkle outfit for kids birthday parties and celebrations.', rating: 4.4, reviewCount: 72, images: ['/images/product_tshirt.png'] },

  // === M-JEANS & W-JEANS ===
  { name: 'Men Premium Slim Fit Stretch Jeans', brand: 'LUXÉ Homme', category: 'jeans', gender: 'men', price: 3499, discountPrice: 2199, discountPercent: 37, sizes: [{ size: '28', stock: 20 }, { size: '30', stock: 25 }, { size: '32', stock: 30 }, { size: '34', stock: 15 }], colors: ['Dark Blue', 'Black'], tags: ['casual', 'trendy', 'classic'], occasion: ['casual', 'date-night', 'office'], description: 'High-grade stretch denim offering superior comfort and slim-fit elegance.', rating: 4.8, reviewCount: 142, images: ['/images/trending_look_1.png'] },
  { name: 'Women High-Waisted Flare Jeans', brand: 'LUXÉ', category: 'jeans', gender: 'women', price: 3299, discountPrice: 1999, discountPercent: 39, sizes: [{ size: '26', stock: 15 }, { size: '28', stock: 20 }, { size: '30', stock: 18 }, { size: '32', stock: 10 }], colors: ['Light Blue', 'Blue'], tags: ['trendy', 'casual'], occasion: ['casual', 'party'], description: 'Flattering high-waist jeans with vintage flare hem design.', rating: 4.9, reviewCount: 189, images: ['/images/trending_look_2.png'] },

  // === M-TSHIRT & M-SHIRTS ===
  { name: 'Men Graphic Heavyweight Oversized Tee', brand: 'LUXÉ Homme', category: 'tshirt', gender: 'men', price: 1499, discountPrice: 899, discountPercent: 40, sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 30 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }], colors: ['White', 'Black'], tags: ['streetwear', 'casual', 'trendy'], occasion: ['casual', 'party'], description: '240 GSM heavy cotton oversized tee with minimal typography.', rating: 4.7, reviewCount: 210, images: ['/images/product_tshirt.png'] },
  { name: 'Men Smart Linen Casual Shirt', brand: 'LUXÉ Homme', category: 'shirt', gender: 'men', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 18 }, { size: 'L', stock: 22 }, { size: 'XL', stock: 10 }], colors: ['Sky Blue', 'White'], tags: ['date-night', 'casual', 'formal'], occasion: ['Office Wear', 'Date Night'], description: 'Breathable pure linen shirt with slim spread collar.', rating: 4.6, reviewCount: 145, images: ['/images/hero_banner_1.png'] },

  // === W-SHIRTS ===
  { name: 'Women Silk Satin Button Down Shirt', brand: 'LUXÉ', category: 'shirt', gender: 'women', price: 2799, discountPrice: 1699, discountPercent: 39, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 12 }], colors: ['Ivory', 'Blush Pink'], tags: ['formal', 'office', 'trendy'], occasion: ['Office Wear', 'Date Night'], description: 'Smooth satin button-down blouse for boardroom elegance.', rating: 4.8, reviewCount: 134, images: ['/images/hero_banner_2.png'] },

  // === BABA SUITS & FROCKS ===
  { name: 'Kids Royal Embroidered Baba Suit Set', brand: 'LUXÉ Petit', category: 'baba-suit', gender: 'kids', price: 1999, discountPrice: 1299, discountPercent: 35, sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 10 }], colors: ['Gold & Maroon'], tags: ['party', 'wedding', 'festival'], occasion: ['wedding', 'festival'], description: 'Adorable 2-piece festive suit set with rich embroidery detailing.', rating: 4.8, reviewCount: 76, images: ['/images/product_jacket.png'] },
  { name: 'Girls Sparkle Tulle Birthday Frock', brand: 'LUXÉ Petit', category: 'frock', gender: 'kids', price: 2499, discountPrice: 1499, discountPercent: 40, sizes: [{ size: 'XS', stock: 15 }, { size: 'S', stock: 22 }, { size: 'M', stock: 18 }], colors: ['Pink', 'Peach'], tags: ['party', 'trendy'], occasion: ['party', 'festival'], description: 'Breezy fairytale tulle frock embellished with sequin glitter.', rating: 4.9, reviewCount: 112, images: ['/images/product_dress.png'] },

  // === KURTA-PYJAMA, LEHENGA CHOLI, SAREE & LEHENGAS ===
  { name: 'Men Silk Blend Designer Kurta Pyjama', brand: 'LUXÉ Homme', category: 'kurta', gender: 'men', price: 4499, discountPrice: 2799, discountPercent: 38, sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 25 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 15 }], colors: ['Royal Blue', 'Emerald Green'], tags: ['wedding', 'festival', 'formal'], occasion: ['wedding', 'festival'], description: 'Luxurious silk blend kurta set with delicate Mandarin collar stitching.', rating: 4.9, reviewCount: 205, images: ['/images/offer_banner.png'] },
  { name: 'Bridal Velvet Embroidered Lehenga Choli', brand: 'LUXÉ', category: 'lehenga-choli', gender: 'women', price: 14999, discountPrice: 9999, discountPercent: 33, sizes: [{ size: 'S', stock: 8 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }], colors: ['Deep Red', 'Magenta'], tags: ['wedding', 'festival', 'formal'], occasion: ['wedding', 'festival'], description: 'Heavy zardozi embroidered bridal lehenga choli set with dupatta.', rating: 5.0, reviewCount: 310, images: ['/images/product_dress.png'] },
  { name: 'Kanjivaram Banarasi Silk Saree', brand: 'LUXÉ', category: 'saree', gender: 'women', price: 6999, discountPrice: 4299, discountPercent: 38, sizes: [{ size: 'One Size', stock: 50 }], colors: ['Gold & Red', 'Green & Gold'], tags: ['wedding', 'festival', 'classic'], occasion: ['wedding', 'festival'], description: 'Authentic Banarasi silk saree with rich woven zari border.', rating: 4.9, reviewCount: 240, images: ['/images/product_dress.png'] },
  { name: 'Designer Georgette Floral Lehenga Set', brand: 'LUXÉ', category: 'lehenga', gender: 'women', price: 8999, discountPrice: 5499, discountPercent: 39, sizes: [{ size: 'S', stock: 12 }, { size: 'M', stock: 15 }, { size: 'L', stock: 8 }], colors: ['Pastel Pink', 'Mint Green'], tags: ['wedding', 'party', 'trendy'], occasion: ['wedding', 'party'], description: 'Lightweight floral printed georgette lehenga with mirror-work blouse.', rating: 4.8, reviewCount: 165, images: ['/images/product_dress.png'] }
];

const sizeMappings = [
  { referenceBrand: "Levi's", referenceSize: '28', category: 'jeans', ourBrandSize: '28', fitNotes: 'True to size. Our jeans have a similar straight cut.' },
  { referenceBrand: "Levi's", referenceSize: '30', category: 'jeans', ourBrandSize: '30', fitNotes: 'True to size. Slight stretch in our fabric.' },
  { referenceBrand: "Levi's", referenceSize: '32', category: 'jeans', ourBrandSize: '31', fitNotes: 'Size down one. Our cut runs slightly bigger in the waist.' },
  { referenceBrand: "Levi's", referenceSize: '34', category: 'jeans', ourBrandSize: '33', fitNotes: 'Size down one. More relaxed hip room in our style.' },
  { referenceBrand: "Levi's", referenceSize: '36', category: 'jeans', ourBrandSize: '35', fitNotes: 'Size down one.' },
  { referenceBrand: 'Zara', referenceSize: 'S', category: 'shirt', ourBrandSize: 'M', fitNotes: 'Size up. Zara runs slim; our fit is standard.' },
  { referenceBrand: 'Zara', referenceSize: 'M', category: 'shirt', ourBrandSize: 'M', fitNotes: 'True to size for our relaxed fit.' },
  { referenceBrand: 'Zara', referenceSize: 'L', category: 'shirt', ourBrandSize: 'L', fitNotes: 'True to size.' },
  { referenceBrand: 'Zara', referenceSize: 'S', category: 'dress', ourBrandSize: 'S', fitNotes: 'True to size. Similar body-con fits.' },
  { referenceBrand: 'Zara', referenceSize: 'M', category: 'dress', ourBrandSize: 'M', fitNotes: 'True to size.' },
  { referenceBrand: 'H&M', referenceSize: 'S', category: 'tshirt', ourBrandSize: 'S', fitNotes: 'True to size. Both are relaxed fit.' },
  { referenceBrand: 'H&M', referenceSize: 'M', category: 'tshirt', ourBrandSize: 'M', fitNotes: 'True to size.' },
  { referenceBrand: 'H&M', referenceSize: 'L', category: 'tshirt', ourBrandSize: 'L', fitNotes: 'True to size. Slightly longer in our cut.' },
  { referenceBrand: 'Nike', referenceSize: '9', category: 'shoes', ourBrandSize: '9', fitNotes: 'True to size for athletic shoes.' },
  { referenceBrand: 'Nike', referenceSize: '10', category: 'shoes', ourBrandSize: '10', fitNotes: 'True to size.' },
  { referenceBrand: 'Uniqlo', referenceSize: 'M', category: 'jacket', ourBrandSize: 'M', fitNotes: 'True to size. Similar tailored fit.' },
  { referenceBrand: 'Uniqlo', referenceSize: 'L', category: 'jacket', ourBrandSize: 'L', fitNotes: 'True to size.' }
];

const associationRules = [
  {
    triggerCategory: 'dress',
    triggerTags: ['party', 'formal', 'date-night'],
    suggestedCategories: ['jewelry', 'bag', 'shoes'],
    confidence: 0.92,
    bundleDiscount: 15,
    bundleName: 'Complete Evening Look',
    description: 'Dress + Earrings + Clutch for a perfect party look'
  },
  {
    triggerCategory: 'shirt',
    triggerTags: ['formal', 'office'],
    suggestedCategories: ['jeans', 'shoes'],
    confidence: 0.85,
    bundleDiscount: 12,
    bundleName: 'Smart Casual Bundle',
    description: 'Shirt + Jeans + Shoes for office-to-dinner style'
  },
  {
    triggerCategory: 'jeans',
    triggerTags: ['casual', 'streetwear'],
    suggestedCategories: ['tshirt', 'shoes', 'jacket'],
    confidence: 0.88,
    bundleDiscount: 15,
    bundleName: 'Street Style Pack',
    description: 'Jeans + Tee + Sneakers for effortless street style'
  }
];

async function seedAll() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionapp';
    await mongoose.connect(mongoUri, { dbName: 'fashionapp' });
    console.log('✅ Connected to MongoDB');

    // Clear existing product, size, and association data
    await Promise.all([
      Product.deleteMany({}),
      SizeMapping.deleteMany({}),
      AssociationRule.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    console.log('\n📸 Inserting Application Products...');

    const productsToInsert = [];

    for (const prodData of rawProducts) {
      productsToInsert.push({
        name: prodData.name,
        brand: prodData.brand,
        category: prodData.category,
        gender: prodData.gender,
        price: prodData.price,
        discountPrice: prodData.discountPrice,
        discountPercent: prodData.discountPercent,
        sizes: prodData.sizes,
        colors: prodData.colors || ['Standard'],
        images: prodData.images,
        tags: prodData.tags,
        occasion: prodData.occasion,
        description: prodData.description,
        rating: prodData.rating || 4.5,
        reviewCount: prodData.reviewCount || 50,
        isActive: true
      });
      console.log(`  ✓ Prepared "${prodData.name}" (${prodData.category})`);
    }

    // Seed products into MongoDB
    const seededProducts = await Product.insertMany(productsToInsert);
    console.log(`\n📦 Seeded ${seededProducts.length} products with local image URLs into MongoDB!`);

    // Auto-assign products to approved sellers
    const approvedSellers = await User.find({ role: 'seller' });
    if (approvedSellers.length > 0) {
      for (let i = 0; i < seededProducts.length; i++) {
        const seller = approvedSellers[i % approvedSellers.length];
        await Product.findByIdAndUpdate(seededProducts[i]._id, { sellerId: seller._id });
      }
      console.log(`🔗 Assigned ${seededProducts.length} products to ${approvedSellers.length} seller(s)`);
    } else {
      console.log('⚠️ No approved sellers found — products seeded without sellerId');
    }

    // Seed size mappings & association rules
    await SizeMapping.insertMany(sizeMappings);
    console.log(`📏 Seeded ${sizeMappings.length} size mappings`);

    await AssociationRule.insertMany(associationRules);
    console.log(`🔗 Seeded ${associationRules.length} association rules`);

    // Create demo user
    const demoUser = await User.findOne({ email: 'demo@fashion.app' });
    if (!demoUser) {
      await User.create({
        name: 'Demo User',
        email: 'demo@fashion.app',
        password: 'demo123456',
        phone: '+91-9876543210',
        addresses: [{
          label: 'Home',
          street: '123 Fashion Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400001',
          isDefault: true
        }],
        sizeProfile: {
          topSize: 'M',
          bottomSize: '32',
          shoeSize: '9',
          preferredBrands: { "Levi's": '32', 'Zara': 'M', 'Nike': '9' }
        },
        stylePreferences: ['trendy', 'casual', 'minimalist']
      });
      console.log('👤 Created demo user (demo@fashion.app / demo123456)');
    }

    console.log('\n✨ ALL APPLICATION DATA AND CATEGORIES SUCCESSFULLY SEEDED TO MONGODB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
