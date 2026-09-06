import OpenAI from 'openai';
import Product from '../models/Product.js';
import SizeMapping from '../models/SizeMapping.js';
import AssociationRule from '../models/AssociationRule.js';
import User from '../models/User.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are StyleAI, an expert fashion stylist for a quick-commerce fashion app. You help users find the perfect outfit based on their needs.

Your capabilities:
1. Understand occasion-based requests (wedding, party, office, date, casual outing)
2. Consider weather and temperature in recommendations
3. Understand urgency (need it in 30 min vs. planning ahead)
4. Suggest complete outfits with accessories
5. Help with sizing using brand comparisons OR user's physical dimensions (height, width/chest, weight)
6. Create bundle deals for coordinated looks

Always be enthusiastic, fashionable, and helpful. Use emojis sparingly. Keep responses concise but informative.
When suggesting products, call the search_products function with extracted parameters. 
If the user provides height/width/weight, include them in the function call so we can recommend the perfect fit.`;

const FUNCTION_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the product catalog based on extracted fashion intent from user message',
      parameters: {
        type: 'object',
        properties: {
          occasion: {
            type: 'string',
            description: 'The occasion or event (wedding, party, office, date, casual, funeral, interview, graduation, beach, gym)'
          },
          urgency: {
            type: 'string',
            enum: ['immediate', 'today', 'this_week', 'no_rush'],
            description: 'How urgently the user needs the items'
          },
          weather: {
            type: 'string',
            description: 'Weather condition or temperature preference (hot, cold, mild, rainy, specific temp like 18C)'
          },
          style_tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Style descriptors (formal, casual, trendy, bohemian, minimalist, streetwear, vintage, classic, layering, semi-formal)'
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific product categories to search (dress, shirt, jeans, tshirt, jacket, accessory, shoes, outerwear, skirt, shorts, sweater, bag, jewelry)'
          },
          colors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Preferred colors'
          },
          budget: {
            type: 'string',
            enum: ['low', 'mid', 'high', 'luxury'],
            description: 'Budget range'
          },
          max_delivery_minutes: {
            type: 'number',
            description: 'Maximum acceptable delivery time in minutes'
          },
          gender: {
            type: 'string',
            enum: ['men', 'women', 'unisex'],
            description: 'Gender preference for products'
          },
          material: {
            type: 'string',
            description: 'The fabric or material (cotton, linen, silk, leather, denim, wool, polyester)'
          },
          size: {
            type: 'string',
            description: 'Specific size (S, M, L, XL, XS, 28, 30, 32, 34)'
          },
          height: {
            type: 'number',
            description: 'User height in cm'
          },
          width: {
            type: 'number',
            description: 'User width/chest measurement in cm'
          },
          weight: {
            type: 'number',
            description: 'User weight in kg'
          }
        },
        required: ['style_tags']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_size_mapping',
      description: 'Check size mapping when user mentions a brand and size they wear',
      parameters: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            description: 'The brand the user currently wears (e.g., Levis, Zara, H&M)'
          },
          size: {
            type: 'string',
            description: 'The size they wear in that brand (e.g., 32, M, L)'
          },
          category: {
            type: 'string',
            description: 'The clothing category (jeans, shirt, dress, etc.)'
          }
        },
        required: ['brand', 'size', 'category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_bundle',
      description: 'Suggest a coordinated bundle of items that go well together',
      parameters: {
        type: 'object',
        properties: {
          primary_category: {
            type: 'string',
            description: 'The main item category the user is interested in'
          },
          style: {
            type: 'string',
            description: 'The overall style theme for the bundle'
          },
          budget: {
            type: 'string',
            enum: ['low', 'mid', 'high', 'luxury']
          }
        },
        required: ['primary_category']
      }
    }
  }
];

export const extractIntent = async (message, chatHistory = []) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: FUNCTION_DEFINITIONS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls;
    const textResponse = choice.message.content;

    const extractedIntents = [];
    if (toolCalls) {
      for (const call of toolCalls) {
        try {
          extractedIntents.push({
            function: call.function.name,
            args: JSON.parse(call.function.arguments),
            id: call.id
          });
        } catch (e) {
          console.error('Failed to parse function args:', e);
        }
      }
    }

    return {
      textResponse,
      intents: extractedIntents,
      rawMessage: choice.message
    };
  } catch (error) {
    console.error('Intent extraction error:', error);
    // Fallback: basic keyword extraction
    return fallbackIntentExtraction(message);
  }
};

export const generateResponse = async (message, context, chatHistory = []) => {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Add context from search results
    if (context) {
      messages.push({
        role: 'system',
        content: `Here are the search results to present to the user:\n${JSON.stringify(context, null, 2)}\n\nPresent these items in an engaging, fashion-forward way. Mention specific product names, prices, and why they match the user's request.`
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Generate response error:', error);
    
    // Smart fallback if LLM fails
    if (context?.products?.length > 0) {
      const bestMatch = context.products[0];
      const count = context.products.length;
      const isExact = bestMatch.matchScore === 100;
      
      return `I found ${count} item${count > 1 ? 's' : ''} that might interest you! ${isExact ? `The ${bestMatch.name} seems like a good fit.` : `I don't have an exact match, but you might like the ${bestMatch.name}.`} 🛍️`;
    }
    
    return "I'm having trouble connecting to my full fashion database right now, but I'm here to help! Could you try describing the style or occasion again? 👗✨";
  }
};

export const analyzeImage = async (imageBase64) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a fashion expert. Analyze the uploaded clothing image and describe: 1) Type of garment, 2) Color and pattern, 3) Style category (casual, formal, etc.), 4) Suggested items that would complement this piece. Return as JSON with keys: garment_type, colors, patterns, style_tags, complementary_items.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this clothing item and suggest matching pieces from our store.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      return { raw: content };
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
};

// Fallback intent extraction when API is unavailable
function fallbackIntentExtraction(message) {
  const lower = message.toLowerCase();
  const intent = { function: 'search_products', args: { style_tags: [] } };

  // Occasion detection
  const occasions = {
    'wedding': ['wedding', 'shaadi', 'marriage'],
    'party': ['party', 'club', 'rooftop', 'celebration', 'birthday'],
    'office': ['office', 'work', 'meeting', 'interview', 'professional'],
    'date': ['date', 'dinner', 'romantic'],
    'casual': ['casual', 'chill', 'hangout', 'everyday'],
    'gym': ['gym', 'workout', 'exercise', 'sports'],
    'beach': ['beach', 'pool', 'summer']
  };

  for (const [occ, keywords] of Object.entries(occasions)) {
    if (keywords.some(k => lower.includes(k))) {
      intent.args.occasion = occ;
      break;
    }
  }

  // Urgency detection
  if (lower.match(/(\d+)\s*(hour|hr|min)/i) || lower.includes('urgent') || lower.includes('asap') || lower.includes('now')) {
    intent.args.urgency = 'immediate';
    const timeMatch = lower.match(/(\d+)\s*(hour|hr)/i);
    if (timeMatch) {
      intent.args.max_delivery_minutes = parseInt(timeMatch[1]) * 60;
    }
    const minMatch = lower.match(/(\d+)\s*min/i);
    if (minMatch) {
      intent.args.max_delivery_minutes = parseInt(minMatch[1]);
    }
  }

  // Weather detection
  const tempMatch = lower.match(/(\d+)\s*°?\s*[cf]/i);
  if (tempMatch) {
    const temp = parseInt(tempMatch[1]);
    intent.args.weather = temp < 15 ? 'cold' : temp > 30 ? 'hot' : 'mild';
  }
  if (lower.includes('cold') || lower.includes('winter')) intent.args.weather = 'cold';
  if (lower.includes('hot') || lower.includes('summer')) intent.args.weather = 'hot';
  if (lower.includes('rain')) intent.args.weather = 'rainy';

  // Style tags
  const styleTags = ['formal', 'casual', 'trendy', 'bohemian', 'minimalist', 'streetwear', 'vintage', 'classic', 'layering', 'semi-formal'];
  intent.args.style_tags = styleTags.filter(t => lower.includes(t));
  if (intent.args.style_tags.length === 0) intent.args.style_tags = ['trendy'];

  // Category detection
  const categories = ['dress', 'shirt', 'jeans', 'tshirt', 'jacket', 'shoes', 'bag', 'jewelry', 'accessory', 'skirt', 'shorts', 'sweater', 'sunglass', 'eyewear', 'watch'];
  intent.args.categories = categories.filter(c => lower.includes(c));
  if (lower.includes('sunglasses')) intent.args.categories.push('sunglass');

  // Color detection
  const colors = ['black', 'white', 'red', 'blue', 'green', 'pink', 'yellow', 'purple', 'navy', 'beige', 'grey', 'gray', 'silver', 'gold', 'brown'];
  intent.args.colors = colors.filter(c => lower.includes(c));

  // Material detection
  const materials = ['cotton', 'linen', 'silk', 'leather', 'denim', 'wool', 'polyester', 'nylon'];
  const foundMaterial = materials.find(m => lower.includes(m));
  if (foundMaterial) intent.args.material = foundMaterial;

  // Size detection
  const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', '28', '30', '32', '34', '36', '38'];
  const foundSize = sizes.find(s => {
    const reg = new RegExp(`\\b${s}\\b`, 'i');
    return reg.test(lower);
  });
  if (foundSize) intent.args.size = foundSize.toUpperCase();

  // Size mapping check
  const sizeMatch = lower.match(/(levi'?s?|zara|h&m|nike|adidas|uniqlo)\s+(\d+|xs|s|m|l|xl|xxl)/i);
  if (sizeMatch) {
    return {
      textResponse: null,
      intents: [
        intent,
        {
          function: 'check_size_mapping',
          args: {
            brand: sizeMatch[1],
            size: sizeMatch[2],
            category: intent.args.categories?.[0] || 'shirt'
          }
        }
      ]
    };
  }

  return {
    textResponse: null,
    intents: [intent]
  };
}

/**
 * Execute product search based on extracted intents
 */
export async function executeProductSearch(args, originalMessage = '', imageAnalysis = null) {
  const filter = { isActive: true };

  let category = args.categories?.[0] || args.primary_category;
  if (!category && imageAnalysis?.item) {
    category = imageAnalysis.item;
  }
  if (category) filter.category = category;

  if (args.gender) filter.gender = { $in: [args.gender, 'unisex'] };

  if (args.style_tags?.length) {
    filter.tags = { $in: args.style_tags };
  }

  if (args.occasion) {
    filter.occasion = { $in: [new RegExp(args.occasion, 'i')] };
  }

  if (args.weather) {
    filter.weather = { $in: [new RegExp(args.weather, 'i')] };
  }

  const rawKeywords = originalMessage
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['want', 'need', 'looking', 'show', 'find', 'give', 'with', 'this', 'that', 'some', 'good', 'best'].includes(w));

  const uniqueKeywords = Array.from(new Set([
    ...rawKeywords,
    ...(args.style_tags || []).map(t => t.toLowerCase()),
    ...(args.colors || []).map(c => c.toLowerCase()),
    ...(args.categories || []).map(cat => cat.toLowerCase())
  ]));

  let measurementFit = null;
  if (args.height || args.width || args.weight) {
    measurementFit = await findBestSizeForDimensions({
      height: args.height,
      width: args.width,
      weight: args.weight,
      category
    });

    if (measurementFit) {
      args.recommendedSize = measurementFit.ourSize;
    }
  }

  if (args.budget) {
    const budgetRanges = {
      low: { $lte: 1000 },
      mid: { $gte: 1000, $lte: 3000 },
      high: { $gte: 3000, $lte: 8000 },
      luxury: { $gte: 8000 }
    };
    filter.price = budgetRanges[args.budget] || {};
  }

  if (args.urgency === 'immediate' || args.max_delivery_minutes) {
    const maxMin = args.max_delivery_minutes || 30;
    filter['deliveryZones.estimatedMinutes'] = { $lte: maxMin };
  }

  filter['sizes.stock'] = { $gt: 0 };
  let products = [];

  if (uniqueKeywords.length > 0) {
    const conditions = uniqueKeywords.map(keyword => {
      let pattern = keyword;
      if (keyword === 'kurti' || keyword === 'kurta') {
        pattern = '(kurti|kurta)';
      }
      const regex = new RegExp(pattern, 'i');
      return {
        $or: [
          { name: regex },
          { description: regex },
          { category: regex },
          { colors: regex },
          { tags: regex }
        ]
      };
    });

    const strictFilter = {
      isActive: true,
      'sizes.stock': { $gt: 0 },
      $and: conditions
    };

    if (args.gender) {
      strictFilter.gender = { $in: [args.gender, 'unisex'] };
    }

    products = await Product.find(strictFilter)
      .sort('-rating -reviewCount')
      .limit(10)
      .select('name brand price discountPrice images category tags colors sizes rating gender description');

    if (products.length > 0) {
      products = products.map(p => ({
        ...p.toObject(),
        matchScore: 100
      }));
    }
  }

  if (products.length === 0) {
    products = await Product.find(filter)
      .sort('-rating -reviewCount')
      .limit(10)
      .select('name brand price discountPrice images category tags colors sizes rating gender description');

    if (products.length > 0) {
      const hasFilters = args.categories?.length || args.style_tags?.length || args.colors?.length || args.occasion || args.gender;
      products = products.map(p => ({
        ...p.toObject(),
        matchScore: hasFilters ? 100 : 50
      }));
    }
  }

  if (products.length === 0) {
    const similarityFilter = {
      isActive: true,
      'sizes.stock': { $gt: 0 }
    };

    if (filter.category) {
      similarityFilter.category = filter.category;
    }

    const candidateProducts = await Product.find(similarityFilter)
      .sort('-rating')
      .limit(50)
      .select('name brand price discountPrice images category tags colors sizes rating gender description');

    products = candidateProducts.map(p => {
      let score = 0;
      if (args.categories?.includes(p.category)) score += 40;
      else if (p.category === args.primary_category) score += 40;
      if (args.colors?.some(c => p.colors?.map(pc => pc.toLowerCase()).includes(c.toLowerCase()))) score += 20;
      if (args.size && p.sizes?.some(s => s.size.toUpperCase() === args.size.toUpperCase() && s.stock > 0)) score += 20;
      if (args.style_tags?.some(t => p.tags?.includes(t))) score += 10;
      return { ...p.toObject(), matchScore: score };
    })
      .filter(p => p.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  return { products, measurementFit };
}

/**
 * Find best size for dimensions
 */
export async function findBestSizeForDimensions({ height, width, weight, category }) {
  const mappings = await SizeMapping.find({ category });
  if (!mappings.length) return null;

  let bestMatch = null;
  let minDiff = Infinity;

  mappings.forEach(m => {
    let diff = 0;
    let count = 0;

    if (width && m.measurementsCm.chest) {
      diff += Math.abs(width - m.measurementsCm.chest);
      count++;
    }
    if (m.measurementsCm.length && height) {
      const estLength = height * 0.4;
      diff += Math.abs(estLength - m.measurementsCm.length) * 0.5;
      count++;
    }

    if (count > 0) {
      const avgDiff = diff / count;
      if (avgDiff < minDiff) {
        minDiff = avgDiff;
        bestMatch = m;
      }
    }
  });

  if (bestMatch && minDiff < 10) {
    return {
      ourSize: bestMatch.ourBrandSize,
      fitNotes: bestMatch.fitNotes,
      measurements: bestMatch.measurementsCm,
      confidence: Math.max(0, 1 - (minDiff / 20))
    };
  }

  return null;
}

/**
 * Execute size mapping
 */
export async function executeSizeMapping(args) {
  const mapping = await SizeMapping.findOne({
    referenceBrand: new RegExp(args.brand, 'i'),
    referenceSize: args.size,
    category: args.category
  });

  if (mapping) {
    return {
      found: true,
      referenceBrand: mapping.referenceBrand,
      referenceSize: mapping.referenceSize,
      ourSize: mapping.ourBrandSize,
      fitNotes: mapping.fitNotes,
      measurements: mapping.measurementsCm
    };
  }

  return {
    found: false,
    suggestion: `We don't have an exact mapping for ${args.brand} ${args.size} in ${args.category} yet. Based on standard sizing, we recommend trying our size ${args.size}.`
  };
}

/**
 * Execute bundle suggestion
 */
export async function executeBundleSuggestion(args) {
  const rules = await AssociationRule.find({
    triggerCategory: args.primary_category,
    isActive: true
  })
    .sort('-confidence')
    .limit(3)
    .populate('suggestedProducts', 'name price discountPrice images brand category');

  if (rules.length > 0) {
    return {
      bundleName: rules[0].bundleName,
      discount: rules[0].bundleDiscount,
      items: rules[0].suggestedProducts,
      confidence: rules[0].confidence
    };
  }

  const complementary = {
    dress: ['jewelry', 'bag', 'shoes'],
    shirt: ['jeans', 'shoes', 'accessory'],
    jeans: ['shirt', 'shoes', 'jacket'],
    tshirt: ['jeans', 'shorts', 'shoes'],
    jacket: ['shirt', 'jeans', 'accessory']
  };

  const cats = complementary[args.primary_category] || ['accessory', 'shoes'];
  const products = await Product.find({
    category: { $in: cats },
    'sizes.stock': { $gt: 0 }
  }).limit(3).select('name price discountPrice images brand category');

  return {
    bundleName: `Complete ${args.primary_category} look`,
    discount: 15,
    items: products,
    confidence: 0.7
  };
}

/**
 * Process full AI conversational recommendation
 */
export const processRecommendation = async ({ message, imageBase64, userId }) => {
  let chatHistory = [];
  if (userId) {
    const user = await User.findById(userId).select('chatHistory sizeProfile stylePreferences');
    chatHistory = user?.chatHistory || [];
  }

  let imageAnalysis = null;
  if (imageBase64) {
    imageAnalysis = await analyzeImage(imageBase64);
  }

  const fullMessage = imageAnalysis
    ? `${message || 'What goes with this?'}\n[Image analysis: ${JSON.stringify(imageAnalysis)}]`
    : message;

  const { textResponse, intents } = await extractIntent(fullMessage, chatHistory);

  const results = {};
  for (const intent of intents) {
    switch (intent.function) {
      case 'search_products':
        const searchResult = await executeProductSearch(intent.args, message, imageAnalysis);
        results.products = searchResult.products;
        results.measurementFit = searchResult.measurementFit;
        break;
      case 'check_size_mapping':
        results.sizeMapping = await executeSizeMapping(intent.args);
        break;
      case 'suggest_bundle':
        results.bundle = await executeBundleSuggestion(intent.args);
        break;
    }
  }

  const aiResponse = textResponse || await generateResponse(fullMessage, results, chatHistory);

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      $push: {
        chatHistory: {
          $each: [
            { role: 'user', content: message, imageUrl: imageBase64 ? 'uploaded' : null },
            { role: 'assistant', content: aiResponse }
          ],
          $slice: -20
        }
      }
    });
  }

  return {
    response: aiResponse,
    products: results.products || [],
    bundle: results.bundle || null,
    sizeMapping: results.sizeMapping || null,
    measurementFit: results.measurementFit || null,
    imageAnalysis
  };
};

export const fetchUserChatHistory = async (userId) => {
  const user = await User.findById(userId).select('chatHistory');
  return user?.chatHistory || [];
};

export const deleteUserChatHistory = async (userId) => {
  await User.findByIdAndUpdate(userId, { chatHistory: [] });
  return { message: 'Chat history cleared.' };
};

export const getSmartFitData = async ({ brand, size, category }) => {
  return await executeSizeMapping({ brand, size, category });
};

export const searchByOccasion = async ({ description, zip, maxDeliveryMinutes = 30 }) => {
  const { intents } = await extractIntent(description);
  const searchIntent = intents.find(i => i.function === 'search_products');

  if (searchIntent) {
    searchIntent.args.max_delivery_minutes = maxDeliveryMinutes;
    const { products, measurementFit } = await executeProductSearch(searchIntent.args, description);
    return {
      products,
      measurementFit,
      extractedIntent: searchIntent.args,
      deliveryFilter: `${maxDeliveryMinutes} min delivery`
    };
  }

  return { products: [], extractedIntent: null };
};

export default {
  extractIntent,
  generateResponse,
  analyzeImage,
  executeProductSearch,
  executeSizeMapping,
  executeBundleSuggestion,
  processRecommendation,
  fetchUserChatHistory,
  deleteUserChatHistory,
  getSmartFitData,
  searchByOccasion
};