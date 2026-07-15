import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const products = [
  // Best Sellers for Kids
  { name: 'Kids Graphic T-Shirt', brand: 'Generic', category: 'tshirt', price: 299, gender: 'kids', images: ['/images/product_tshirt.png'] },
  { name: 'Kids Casual Shorts', brand: 'Generic', category: 'shorts', price: 399, gender: 'kids', images: ['/images/product_sneakers.png'] },
  { name: 'Kids Party Dress', brand: 'Generic', category: 'dress', price: 899, gender: 'kids', images: ['/images/product_dress.png'] },
  { name: 'Kids Denim Jacket', brand: 'Generic', category: 'jacket', price: 1299, gender: 'kids', images: ['/images/product_jacket.png'] },

  // Best Sellers for Women
  { name: 'Women Floral Dress', brand: 'Generic', category: 'dress', price: 1499, gender: 'women', images: ['/images/product_dress.png'] },
  { name: 'Women Leather Handbag', brand: 'Generic', category: 'bag', price: 2499, gender: 'women', images: ['/images/product_handbag.png'] },
  { name: 'Women Casual Sneakers', brand: 'Generic', category: 'shoes', price: 1999, gender: 'women', images: ['/images/product_sneakers.png'] },
  { name: 'Women Elegant Watch', brand: 'Generic', category: 'accessory', price: 3499, gender: 'women', images: ['/images/product_watch.png'] },

  // Up to 60% off | Kurti, Pajama, Scrab
  { name: 'Designer Kurti', brand: 'Generic', category: 'shirt', price: 1999, discountPrice: 799, gender: 'women', images: ['/images/hero_banner_2.png'] },
  { name: 'Comfortable Pajama', brand: 'Generic', category: 'jeans', price: 999, discountPrice: 399, gender: 'women', images: ['/images/trending_look_1.png'] },
  { name: 'Printed Scrab', brand: 'Generic', category: 'accessory', price: 499, discountPrice: 199, gender: 'women', images: ['/images/offer_banner.png'] },
  { name: 'Ethnic Set', brand: 'Generic', category: 'dress', price: 2999, discountPrice: 1199, gender: 'women', images: ['/images/hero_banner_1.png'] },

  // Top Deals on | Men's Underwear
  { name: 'Men Cotton Trunks', brand: 'Generic', category: 'shorts', price: 599, discountPrice: 299, gender: 'men', images: ['/images/product_tshirt.png'] },
  { name: 'Men Boxer Briefs', brand: 'Generic', category: 'shorts', price: 699, discountPrice: 349, gender: 'men', images: ['/images/product_sneakers.png'] },
  { name: 'Men Basic Briefs', brand: 'Generic', category: 'shorts', price: 499, discountPrice: 249, gender: 'men', images: ['/images/product_watch.png'] },
  { name: 'Men Athletic Supporter', brand: 'Generic', category: 'shorts', price: 799, discountPrice: 399, gender: 'men', images: ['/images/product_jacket.png'] },

  // Starting price at 199 | Men's T-shirts
  ...Array.from({ length: 8 }).map((_, i) => ({
    name: `Men Basic T-Shirt ${i+1}`,
    brand: 'Generic',
    category: 'tshirt',
    price: 199 + (i * 50),
    gender: 'men',
    images: ['/images/product_tshirt.png']
  })),

  // Party Night
  { name: 'Sequin Party Dress', brand: 'Generic', category: 'dress', price: 2999, occasion: ['party'], images: ['/images/product_dress.png'] },
  { name: 'Men Party Blazer', brand: 'Generic', category: 'jacket', price: 4999, occasion: ['party'], images: ['/images/product_jacket.png'] },
  { name: 'Party Clutch Bag', brand: 'Generic', category: 'bag', price: 1499, occasion: ['party'], images: ['/images/product_handbag.png'] },
  { name: 'Statement Necklace', brand: 'Generic', category: 'jewelry', price: 899, occasion: ['party'], images: ['/images/product_watch.png'] },

  // Office Wear
  { name: 'Men Formal Shirt', brand: 'Generic', category: 'shirt', price: 1299, occasion: ['office'], images: ['/images/product_shirt.png', '/images/product_tshirt.png'] },
  { name: 'Women Blazer', brand: 'Generic', category: 'jacket', price: 2499, occasion: ['office'], images: ['/images/product_jacket.png'] },
  { name: 'Formal Trousers', brand: 'Generic', category: 'jeans', price: 1599, occasion: ['office'], images: ['/images/trending_look_1.png'] },
  { name: 'Leather Formal Shoes', brand: 'Generic', category: 'shoes', price: 2999, occasion: ['office'], images: ['/images/product_sneakers.png'] },

  // Date Night
  { name: 'Romantic Evening Dress', brand: 'Generic', category: 'dress', price: 3499, occasion: ['date-night'], images: ['/images/product_dress.png'] },
  { name: 'Men Smart Casual Shirt', brand: 'Generic', category: 'shirt', price: 1499, occasion: ['date-night'], images: ['/images/hero_banner_1.png'] },
  { name: 'Elegant Crossbody Bag', brand: 'Generic', category: 'bag', price: 1999, occasion: ['date-night'], images: ['/images/product_handbag.png'] },
  { name: 'Stylish Chronograph', brand: 'Generic', category: 'accessory', price: 4999, occasion: ['date-night'], images: ['/images/product_watch.png'] },

  // Festival
  { name: 'Traditional Ethnic Wear', brand: 'Generic', category: 'dress', price: 4999, occasion: ['festival'], images: ['/images/hero_banner_2.png'] },
  { name: 'Men Kurta Set', brand: 'Generic', category: 'shirt', price: 2999, occasion: ['festival'], images: ['/images/offer_banner.png'] },
  { name: 'Embroidered Handbag', brand: 'Generic', category: 'bag', price: 1299, occasion: ['festival'], images: ['/images/product_handbag.png'] },
  { name: 'Festive Jewelry Set', brand: 'Generic', category: 'jewelry', price: 3999, occasion: ['festival'], images: ['/images/product_watch.png'] },

  // Up to 80% off | Kids dresses
  ...Array.from({ length: 8 }).map((_, i) => ({
    name: `Kids Cute Dress ${i+1}`,
    brand: 'Generic',
    category: 'dress',
    price: 1999,
    discountPrice: 399,
    gender: 'kids',
    images: ['/images/product_dress.png']
  })),

  // Zara
  ...Array.from({ length: 4 }).map((_, i) => ({ name: `Zara Trendy Look ${i+1}`, brand: 'Zara', category: 'dress', price: 3999, images: ['/images/trending_look_1.png'] })),

  // H&M
  ...Array.from({ length: 4 }).map((_, i) => ({ name: `H&M Casual Wear ${i+1}`, brand: 'H&M', category: 'tshirt', price: 1499, images: ['/images/trending_look_2.png'] })),

  // Levi's
  ...Array.from({ length: 4 }).map((_, i) => ({ name: `Levi's Classic Denim ${i+1}`, brand: "Levi's", category: 'jeans', price: 2999, images: ['/images/product_jacket.png'] })),

  // Nike
  ...Array.from({ length: 4 }).map((_, i) => ({ name: `Nike Sportswear ${i+1}`, brand: 'Nike', category: 'shoes', price: 5999, images: ['/images/product_sneakers.png'] })),
];

const seedHomepageProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    console.log(`Seeding ${products.length} products...`);
    await Product.insertMany(products);
    console.log('Successfully seeded homepage products!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedHomepageProducts();
