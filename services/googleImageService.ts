/**
 * Google Custom Search API Service
 * Fetches real crop images from Google Images
 * 
 * NOTE: Currently using LoremFlickr as primary source due to CORS issues
 * with many Google Image results. Google API code is preserved for future use.
 */

// Google API credentials (preserved for future use)
// const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
// const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
// const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

// Preserved for future Google API implementation
// interface GoogleImageResult {
//   link: string;
//   image: {
//     thumbnailLink: string;
//     contextLink: string;
//   };
//   title: string;
// }

// interface GoogleSearchResponse {
//   items?: GoogleImageResult[];
//   error?: {
//     message: string;
//     code: number;
//   };
// }

/**
 * Search Google Images for crop photos
 * @param cropName - Name of the crop to search for
 * @param useCache - Whether to use cached results (default: true)
 * @returns Image URL or fallback to LoremFlickr
 */
export async function searchCropImage(cropName: string, useCache: boolean = true): Promise<string> {
  try {
    console.log('🔍 searchCropImage called for:', cropName);
    
    // Check cache first
    const cacheKey = `crop_image_${cropName.toLowerCase()}`;
    if (useCache) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        console.log(`✅ Using cached image for: ${cropName}`);
        return cached;
      }
    }

    // STRATEGY: Use beautiful emoji placeholders as PRIMARY source
    // They ALWAYS work (no external requests, no CORS issues)
    // Real photos kept as backup in CROP_IMAGE_MAP if needed later
    const emojiUrl = getEmojiPlaceholder(cropName);
    console.log(`✅ Using emoji placeholder for ${cropName}`);
    
    // Cache the result
    sessionStorage.setItem(cacheKey, emojiUrl);
    return emojiUrl;

  } catch (error) {
    console.error(`❌ Error fetching image for ${cropName}:`, error);
    return getFallbackImageUrl(cropName);
  }
}

/**
 * Crop emoji mapping for beautiful, relevant placeholders
 */
const CROP_EMOJI_MAP: Record<string, { emoji: string; color: string }> = {
  // Vegetables
  'tomatoes': { emoji: '🍅', color: 'ef4444' },
  'tomato': { emoji: '🍅', color: 'ef4444' },
  'lettuce': { emoji: '🥬', color: '22c55e' },
  'peppers': { emoji: '🌶️', color: 'f97316' },
  'pepper': { emoji: '🌶️', color: 'f97316' },
  'cucumber': { emoji: '🥒', color: '22c55e' },
  'cucumbers': { emoji: '🥒', color: '22c55e' },
  'carrots': { emoji: '🥕', color: 'f97316' },
  'carrot': { emoji: '🥕', color: 'f97316' },
  'onions': { emoji: '🧅', color: 'a855f7' },
  'onion': { emoji: '🧅', color: 'a855f7' },
  'cabbage': { emoji: '🥬', color: '22c55e' },
  'broccoli': { emoji: '🥦', color: '22c55e' },
  'cauliflower': { emoji: '🥦', color: 'f3f4f6' },
  'eggplant': { emoji: '🍆', color: '9333ea' },
  'garlic': { emoji: '🧄', color: 'f3f4f6' },
  
  // Fruits
  'strawberries': { emoji: '🍓', color: 'ef4444' },
  'strawberry': { emoji: '🍓', color: 'ef4444' },
  'blueberries': { emoji: '🫐', color: '3b82f6' },
  'blueberry': { emoji: '🫐', color: '3b82f6' },
  'apples': { emoji: '🍎', color: 'ef4444' },
  'apple': { emoji: '🍎', color: 'ef4444' },
  
  // Herbs
  'basil': { emoji: '🌿', color: '22c55e' },
  'mint': { emoji: '🌿', color: '10b981' },
  'parsley': { emoji: '🌿', color: '22c55e' },
  'cilantro': { emoji: '🌿', color: '22c55e' },
  'coriander': { emoji: '🌿', color: '22c55e' },
  
  // Grains
  'wheat': { emoji: '🌾', color: 'eab308' },
  'rice': { emoji: '🌾', color: 'f3f4f6' },
  'corn': { emoji: '🌽', color: 'eab308' },
  'maize': { emoji: '🌽', color: 'eab308' },
  'barley': { emoji: '🌾', color: 'd97706' },
  'oats': { emoji: '🌾', color: 'd97706' },
  
  // Legumes
  'beans': { emoji: '🫘', color: '78350f' },
  'peas': { emoji: '🫛', color: '22c55e' },
  'chickpeas': { emoji: '🫘', color: 'd97706' },
  'lentils': { emoji: '🫘', color: 'ea580c' },
  
  // Root vegetables
  'potatoes': { emoji: '🥔', color: 'a855f7' },
  'potato': { emoji: '🥔', color: 'a855f7' },
  'sweet potatoes': { emoji: '🍠', color: 'f97316' },
  'sweet potato': { emoji: '🍠', color: 'f97316' },
  'radishes': { emoji: '🌶️', color: 'ef4444' },
  'radish': { emoji: '🌶️', color: 'ef4444' },
  'beets': { emoji: '🥬', color: 'dc2626' },
  'beet': { emoji: '🥬', color: 'dc2626' },
  'ginger': { emoji: '🫚', color: 'd97706' },
  
  // Leafy greens
  'spinach': { emoji: '🥬', color: '15803d' },
  'kale': { emoji: '🥬', color: '166534' },
  'arugula': { emoji: '🥬', color: '22c55e' },
  
  // Squash
  'pumpkins': { emoji: '🎃', color: 'f97316' },
  'pumpkin': { emoji: '🎃', color: 'f97316' },
  'zucchini': { emoji: '🥒', color: '22c55e' },
  'squash': { emoji: '🥒', color: 'f97316' },
};

/**
 * Get beautiful emoji placeholder for a crop
 */
function getEmojiPlaceholder(cropName: string): string {
  const normalized = cropName.toLowerCase().trim();
  const cropData = CROP_EMOJI_MAP[normalized] || { emoji: '🌱', color: '22c55e' };
  
  // Create a beautiful SVG placeholder with emoji
  const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#${cropData.color}"/><text x="150" y="120" font-size="80" text-anchor="middle" fill="white">${cropData.emoji}</text></svg>`;
  
  // Encode as data URI (URL-safe encoding)
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Comprehensive crop image database using multiple reliable sources
 * Using direct CDN URLs with CORS-enabled proxies
 */
const CROP_IMAGE_MAP: Record<string, string[]> = {
  // Vegetables - Using reliable image sources
  'tomatoes': [
    'https://cdn.pixabay.com/photo/2015/05/31/11/26/tomatoes-791539_640.jpg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍅+Tomatoes',
  ],
  'tomato': [
    'https://cdn.pixabay.com/photo/2015/05/31/11/26/tomatoes-791539_640.jpg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍅+Tomato',
  ],
  'lettuce': [
    'https://cdn.pixabay.com/photo/2017/09/04/18/39/lettuce-2714677_640.jpg',
    'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300',
    'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/22c55e/ffffff?text=🥬+Lettuce',
  ],
  'peppers': [
    'https://cdn.pixabay.com/photo/2016/03/05/22/31/bell-pepper-1239308_640.jpg',
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300',
    'https://images.pexels.com/photos/128536/pexels-photo-128536.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/f97316/ffffff?text=🌶️+Peppers',
  ],
  'pepper': [
    'https://cdn.pixabay.com/photo/2016/03/05/22/31/bell-pepper-1239308_640.jpg',
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300',
    'https://images.pexels.com/photos/128536/pexels-photo-128536.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/f97316/ffffff?text=🌶️+Pepper',
  ],
  'cucumber': [
    'https://cdn.pixabay.com/photo/2014/11/27/18/36/cucumbers-548354_640.jpg',
    'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300',
    'https://images.pexels.com/photos/37528/cucumber-salad-food-healthy-37528.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/22c55e/ffffff?text=🥒+Cucumber',
  ],
  'cucumbers': [
    'https://cdn.pixabay.com/photo/2014/11/27/18/36/cucumbers-548354_640.jpg',
    'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300',
    'https://images.pexels.com/photos/37528/cucumber-salad-food-healthy-37528.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/22c55e/ffffff?text=🥒+Cucumbers',
  ],
  'carrots': [
    'https://cdn.pixabay.com/photo/2017/01/20/15/06/carrots-1995055_640.jpg',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
    'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/f97316/ffffff?text=🥕+Carrots',
  ],
  'carrot': [
    'https://cdn.pixabay.com/photo/2017/01/20/15/06/carrots-1995055_640.jpg',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
    'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/f97316/ffffff?text=🥕+Carrot',
  ],
  'onions': [
    'https://cdn.pixabay.com/photo/2013/02/21/19/11/onion-bulbs-84722_640.jpg',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
  ],
  'onion': [
    'https://cdn.pixabay.com/photo/2013/02/21/19/11/onion-bulbs-84722_640.jpg',
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
  ],
  'cabbage': [
    'https://cdn.pixabay.com/photo/2017/09/30/15/10/savoy-cabbage-2802482_640.jpg',
    'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300',
  ],
  'broccoli': [
    'https://cdn.pixabay.com/photo/2016/03/05/22/59/broccoli-1239271_640.jpg',
  ],
  'cauliflower': [
    'https://cdn.pixabay.com/photo/2017/01/19/08/21/cauliflower-1991104_640.jpg',
  ],
  
  // Fruits
  'strawberries': [
    'https://cdn.pixabay.com/photo/2016/04/15/08/04/strawberries-1330459_640.jpg',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300',
    'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍓+Strawberries',
  ],
  'strawberry': [
    'https://cdn.pixabay.com/photo/2016/04/15/08/04/strawberries-1330459_640.jpg',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300',
    'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍓+Strawberry',
  ],
  'blueberries': [
    'https://cdn.pixabay.com/photo/2017/08/03/08/08/blueberries-2574744_640.jpg',
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300',
    'https://images.pexels.com/photos/39308/berries-fruits-food-blackberries-39308.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/3b82f6/ffffff?text=🫐+Blueberries',
  ],
  'blueberry': [
    'https://cdn.pixabay.com/photo/2017/08/03/08/08/blueberries-2574744_640.jpg',
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300',
    'https://images.pexels.com/photos/39308/berries-fruits-food-blackberries-39308.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/3b82f6/ffffff?text=🫐+Blueberry',
  ],
  'apples': [
    'https://cdn.pixabay.com/photo/2017/06/20/22/14/man-2424039_640.jpg',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍎+Apples',
  ],
  'apple': [
    'https://cdn.pixabay.com/photo/2017/06/20/22/14/man-2424039_640.jpg',
    'https://via.placeholder.com/300x200/ef4444/ffffff?text=🍎+Apple',
  ],
  
  // Herbs
  'basil': [
    'https://cdn.pixabay.com/photo/2016/03/02/20/42/basil-1232698_640.jpg',
    'https://images.unsplash.com/photo-1618375569909-3c8616cf7e55?w=300',
    'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&w=300',
    'https://via.placeholder.com/300x200/22c55e/ffffff?text=🌿+Basil',
  ],
  'mint': [
    'https://cdn.pixabay.com/photo/2017/09/12/11/56/mint-2742871_640.jpg',
    'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=300',
  ],
  'parsley': [
    'https://cdn.pixabay.com/photo/2017/03/16/21/18/parsley-2150843_640.jpg',
    'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=300',
  ],
  'cilantro': [
    'https://cdn.pixabay.com/photo/2017/03/16/21/18/coriander-2150856_640.jpg',
  ],
  'coriander': [
    'https://cdn.pixabay.com/photo/2017/03/16/21/18/coriander-2150856_640.jpg',
  ],
  
  // Grains
  'wheat': [
    'https://cdn.pixabay.com/photo/2016/08/11/08/04/wheat-1585612_640.jpg',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300',
  ],
  'rice': [
    'https://cdn.pixabay.com/photo/2016/02/29/05/46/brown-rice-1226053_640.jpg',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
  ],
  'corn': [
    'https://cdn.pixabay.com/photo/2016/08/30/18/45/corn-1631245_640.jpg',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300',
  ],
  'maize': [
    'https://cdn.pixabay.com/photo/2016/08/30/18/45/corn-1631245_640.jpg',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300',
  ],
  'barley': [
    'https://cdn.pixabay.com/photo/2014/10/22/16/38/barley-field-498908_640.jpg',
  ],
  'oats': [
    'https://cdn.pixabay.com/photo/2016/11/14/03/05/oats-1822575_640.jpg',
  ],
  
  // Legumes
  'beans': [
    'https://cdn.pixabay.com/photo/2015/05/30/01/18/green-beans-789488_640.jpg',
  ],
  'peas': [
    'https://cdn.pixabay.com/photo/2015/05/31/13/10/peas-791357_640.jpg',
  ],
  'chickpeas': [
    'https://cdn.pixabay.com/photo/2017/10/03/22/01/chickpeas-2813262_640.jpg',
  ],
  'lentils': [
    'https://cdn.pixabay.com/photo/2017/09/06/08/41/lentils-2720785_640.jpg',
  ],
  
  // Root vegetables
  'potatoes': [
    'https://cdn.pixabay.com/photo/2016/08/11/08/43/potatoes-1585075_640.jpg',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
  ],
  'potato': [
    'https://cdn.pixabay.com/photo/2016/08/11/08/43/potatoes-1585075_640.jpg',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
  ],
  'sweet potatoes': [
    'https://cdn.pixabay.com/photo/2020/03/03/20/42/sweet-potato-4899015_640.jpg',
    'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300',
  ],
  'sweet potato': [
    'https://cdn.pixabay.com/photo/2020/03/03/20/42/sweet-potato-4899015_640.jpg',
    'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300',
  ],
  'radishes': [
    'https://cdn.pixabay.com/photo/2016/08/09/10/30/radishes-1580017_640.jpg',
  ],
  'radish': [
    'https://cdn.pixabay.com/photo/2016/08/09/10/30/radishes-1580017_640.jpg',
  ],
  'beets': [
    'https://cdn.pixabay.com/photo/2017/10/06/09/37/beetroot-2822587_640.jpg',
  ],
  'beet': [
    'https://cdn.pixabay.com/photo/2017/10/06/09/37/beetroot-2822587_640.jpg',
  ],
  
  // Leafy greens
  'spinach': [
    'https://cdn.pixabay.com/photo/2017/05/09/03/46/spinach-2297606_640.jpg',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300',
  ],
  'kale': [
    'https://cdn.pixabay.com/photo/2016/07/17/08/30/kale-1523039_640.jpg',
    'https://images.unsplash.com/photo-1560200265-e8abb047b0c0?w=300',
  ],
  'arugula': [
    'https://cdn.pixabay.com/photo/2019/09/18/18/31/arugula-4487056_640.jpg',
  ],
  
  // Squash & gourds
  'pumpkins': [
    'https://cdn.pixabay.com/photo/2016/09/18/18/51/pumpkins-1678891_640.jpg',
  ],
  'pumpkin': [
    'https://cdn.pixabay.com/photo/2016/09/18/18/51/pumpkins-1678891_640.jpg',
  ],
  'zucchini': [
    'https://cdn.pixabay.com/photo/2017/07/01/18/40/zucchini-2462511_640.jpg',
  ],
  'squash': [
    'https://cdn.pixabay.com/photo/2016/09/15/08/03/pumpkin-1671450_640.jpg',
  ],
  
  // Others
  'eggplant': [
    'https://cdn.pixabay.com/photo/2014/10/03/10/23/eggplant-472101_640.jpg',
  ],
  'garlic': [
    'https://cdn.pixabay.com/photo/2014/08/06/19/31/garlic-411499_640.jpg',
  ],
  'ginger': [
    'https://cdn.pixabay.com/photo/2017/03/26/21/59/ginger-2176405_640.jpg',
  ],
};

/**
 * Get image URL for a crop with smart fallback system
 */
function getFallbackImageUrl(cropName: string): string {
  const normalized = cropName.toLowerCase().trim();
  
  // Try to find exact match in our curated collection
  const imageUrls = CROP_IMAGE_MAP[normalized];
  
  if (imageUrls && imageUrls.length > 0) {
    // Return first URL from curated collection
    const url = imageUrls[0];
    console.log(`🎯 Using curated image for ${cropName}:`, url);
    return url;
  }
  
  // Fallback: Create a beautiful emoji placeholder
  const placeholder = getEmojiPlaceholder(cropName);
  console.log(`📦 Using emoji placeholder for ${cropName}`);
  return placeholder;
}

/**
 * Get multiple image URL options for a crop
 * Returns array of URLs to try in order
 */
export function getCropImageFallbacks(cropName: string): string[] {
  const normalized = cropName.toLowerCase().trim();
  const imageUrls = CROP_IMAGE_MAP[normalized];
  
  // Emoji placeholder as ultimate fallback (always works, beautiful)
  const emojiPlaceholder = getEmojiPlaceholder(cropName);
  
  if (imageUrls && imageUrls.length > 0) {
    // Return all curated URLs for this crop + emoji placeholder
    return [
      ...imageUrls,
      emojiPlaceholder,
    ];
  }
  
  // No curated images, return emoji placeholder only
  return [emojiPlaceholder];
}

/**
 * Preload images for better performance
 */
export function preloadCropImages(cropNames: string[]): void {
  cropNames.forEach(cropName => {
    searchCropImage(cropName, true).then(url => {
      const img = new Image();
      img.src = url;
    });
  });
}

/**
 * Clear image cache
 */
export function clearImageCache(): void {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('crop_image_')) {
      sessionStorage.removeItem(key);
    }
  });
  console.log('🗑️ Image cache cleared');
}
