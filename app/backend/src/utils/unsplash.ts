/**
 * Unsplash API Integration
 * Fetches stock photos based on business category
 */

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

// Map business categories to search queries
const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  restaurant: ['restaurant interior', 'food plating', 'dining experience', 'chef cooking'],
  cafe: ['coffee shop', 'cafe interior', 'barista', 'pastry display'],
  bakery: ['bakery', 'fresh bread', 'pastries', 'baking'],
  photography: ['photography studio', 'camera equipment', 'photo session', 'portrait photography'],
  fitness: ['gym equipment', 'fitness training', 'workout', 'personal training'],
  yoga: ['yoga studio', 'meditation', 'yoga practice', 'wellness'],
  spa: ['spa treatment', 'massage therapy', 'relaxation', 'wellness center'],
  salon: ['hair salon', 'beauty treatment', 'hairstyling', 'beauty salon'],
  beauty: ['beauty treatment', 'skincare', 'makeup', 'beauty salon'],
  dental: ['dental clinic', 'dental care', 'dentist office', 'smile'],
  medical: ['medical clinic', 'healthcare', 'doctor office', 'medical care'],
  legal: ['law office', 'legal documents', 'attorney office', 'courtroom'],
  consulting: ['business meeting', 'consulting', 'office workspace', 'professional team'],
  accounting: ['accounting office', 'financial documents', 'calculator', 'business finance'],
  real_estate: ['real estate', 'house exterior', 'property', 'home interior'],
  construction: ['construction site', 'building', 'architecture', 'renovation'],
  plumbing: ['plumbing work', 'plumber', 'bathroom renovation', 'pipes'],
  electrical: ['electrician work', 'electrical installation', 'lighting', 'wiring'],
  cleaning: ['cleaning service', 'clean home', 'professional cleaning', 'spotless'],
  landscaping: ['landscaping', 'garden design', 'lawn care', 'outdoor space'],
  automotive: ['auto repair', 'car service', 'mechanic', 'automotive'],
  pet: ['pet grooming', 'veterinary', 'pet care', 'animals'],
  education: ['classroom', 'education', 'learning', 'tutoring'],
  technology: ['technology office', 'software development', 'tech workspace', 'coding'],
  retail: ['retail store', 'shopping', 'product display', 'store interior'],
  ecommerce: ['ecommerce', 'online shopping', 'product photography', 'packaging'],
  wedding: ['wedding photography', 'wedding venue', 'wedding planning', 'ceremony'],
  event: ['event planning', 'party decoration', 'corporate event', 'celebration'],
  music: ['music studio', 'musician', 'instruments', 'recording'],
  art: ['art studio', 'artist workspace', 'gallery', 'creative'],
  default: ['professional business', 'modern office', 'team collaboration', 'workspace'],
};

/**
 * Direct Unsplash image URLs by category (no API key required)
 * These are curated, high-quality images that work without authentication
 * Image URLs from images.unsplash.com don't count against rate limits
 */
const FALLBACK_IMAGES: Record<string, { hero: string; gallery: string[] }> = {
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    ],
  },
  cafe: {
    hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80',
      'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    ],
  },
  fitness: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    ],
  },
  spa: {
    hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
      'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80',
    ],
  },
  salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
    ],
  },
  beauty: {
    hero: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80',
      'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&q=80',
    ],
  },
  photography: {
    hero: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
    ],
  },
  consulting: {
    hero: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    ],
  },
  technology: {
    hero: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    ],
  },
  medical: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&q=80',
    ],
  },
  dental: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80',
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
      'https://images.unsplash.com/photo-1445527815219-ecbfec67492e?w=800&q=80',
      'https://images.unsplash.com/photo-1626908013351-800ddd734b8a?w=800&q=80',
    ],
  },
  legal: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=80',
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=80',
    ],
  },
  real_estate: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
    ],
  },
  construction: {
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      'https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=800&q=80',
      'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800&q=80',
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    ],
  },
  automotive: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da27?w=800&q=80',
      'https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?w=800&q=80',
    ],
  },
  pet: {
    hero: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80',
    ],
  },
  education: {
    hero: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
    ],
  },
  wedding: {
    hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800&q=80',
      'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800&q=80',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80',
      'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=800&q=80',
    ],
  },
  event: {
    hero: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80',
    ],
  },
  default: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
    ],
  },
};

/**
 * Get fallback images for a category (no API key required)
 * Uses smart keyword matching with word boundaries to avoid false positives
 */
function getFallbackImages(category: string, services: string[] = []): { hero: string; gallery: string[] } {
  const normalizedCategory = category.toLowerCase().trim();
  const normalizedServices = services.map(s => s.toLowerCase().trim());
  const allText = [normalizedCategory, ...normalizedServices].join(' ');

  console.log(`📸 Matching images for category: "${normalizedCategory}", services: ${JSON.stringify(normalizedServices)}`);

  // Priority-ordered keyword patterns (most specific first)
  // Using word boundary checks to avoid partial matches like "tech" in "stretch"
  const categoryPatterns: Array<{ pattern: RegExp | string[]; category: string; priority: number }> = [
    // Technology & Software (high priority - common business type)
    { pattern: ['saas', 'software', 'developer', 'programming', 'coding', 'startup'], category: 'technology', priority: 10 },
    { pattern: /\btech\b/, category: 'technology', priority: 10 },
    { pattern: /\bapp\b/, category: 'technology', priority: 9 },
    { pattern: /\bweb\s*(design|develop|site)/, category: 'technology', priority: 10 },
    { pattern: ['digital agency', 'it service', 'cloud', 'ai ', 'data analyst'], category: 'technology', priority: 10 },

    // Sales & Consulting (common B2B)
    { pattern: ['sales', 'b2b', 'crm', 'lead gen', 'marketing agency'], category: 'consulting', priority: 9 },
    { pattern: /\bconsult/, category: 'consulting', priority: 9 },
    { pattern: ['coach', 'mentor', 'advisor', 'strategist'], category: 'consulting', priority: 8 },

    // Food & Beverage
    { pattern: ['restaurant', 'bistro', 'diner', 'eatery', 'food truck'], category: 'restaurant', priority: 10 },
    { pattern: ['cafe', 'coffee shop', 'coffeehouse', 'espresso'], category: 'cafe', priority: 10 },
    { pattern: ['bakery', 'pastry', 'cake shop', 'dessert'], category: 'cafe', priority: 9 },
    { pattern: ['catering', 'chef', 'meal prep'], category: 'restaurant', priority: 8 },

    // Beauty & Personal Care
    { pattern: ['salon', 'hair studio', 'hairdresser', 'barber'], category: 'salon', priority: 10 },
    { pattern: ['haircut', 'hair color', 'hairstyl'], category: 'salon', priority: 9 },
    { pattern: ['beauty', 'makeup', 'cosmetic', 'skincare', 'esthetician'], category: 'beauty', priority: 10 },
    { pattern: ['nail', 'manicure', 'pedicure'], category: 'beauty', priority: 9 },
    { pattern: ['spa', 'massage', 'wellness center', 'relaxation'], category: 'spa', priority: 10 },
    { pattern: ['facial', 'body treatment', 'aromatherapy'], category: 'spa', priority: 8 },

    // Fitness & Health
    { pattern: ['gym', 'fitness center', 'health club'], category: 'fitness', priority: 10 },
    { pattern: ['personal train', 'workout', 'crossfit', 'pilates'], category: 'fitness', priority: 9 },
    { pattern: /\byoga\b/, category: 'fitness', priority: 9 },

    // Medical & Healthcare
    { pattern: ['medical', 'healthcare', 'clinic', 'hospital'], category: 'medical', priority: 10 },
    { pattern: ['doctor', 'physician', 'nurse', 'therapist'], category: 'medical', priority: 9 },
    { pattern: ['dental', 'dentist', 'orthodont', 'teeth'], category: 'dental', priority: 10 },

    // Legal
    { pattern: ['law firm', 'attorney', 'lawyer', 'legal service'], category: 'legal', priority: 10 },
    { pattern: /\blaw\b/, category: 'legal', priority: 8 },

    // Real Estate & Property
    { pattern: ['real estate', 'realtor', 'property', 'broker'], category: 'real_estate', priority: 10 },
    { pattern: ['home stag', 'interior design'], category: 'real_estate', priority: 8 },

    // Construction & Trades
    { pattern: ['construction', 'contractor', 'builder', 'renovation'], category: 'construction', priority: 10 },
    { pattern: ['plumb', 'electric', 'hvac', 'handyman'], category: 'construction', priority: 8 },

    // Automotive
    { pattern: ['auto repair', 'car service', 'mechanic', 'body shop'], category: 'automotive', priority: 10 },
    { pattern: ['car wash', 'detailing', 'tire'], category: 'automotive', priority: 8 },

    // Pets & Animals
    { pattern: ['pet', 'dog', 'cat', 'veterinar', 'animal'], category: 'pet', priority: 10 },
    { pattern: ['grooming', 'boarding', 'pet sit'], category: 'pet', priority: 9 },

    // Education
    { pattern: ['school', 'academy', 'tutor', 'education'], category: 'education', priority: 10 },
    { pattern: ['teach', 'learn', 'training center', 'course'], category: 'education', priority: 8 },

    // Events & Entertainment
    { pattern: ['wedding', 'bridal', 'marriage'], category: 'wedding', priority: 10 },
    { pattern: ['event plan', 'party', 'celebration', 'catering'], category: 'event', priority: 9 },
    { pattern: ['photography', 'photographer', 'photo studio'], category: 'photography', priority: 10 },
    { pattern: ['videograph', 'film', 'video produc'], category: 'photography', priority: 9 },
  ];

  // Score each category based on matches
  const scores: Record<string, number> = {};

  for (const { pattern, category, priority } of categoryPatterns) {
    let matched = false;

    if (pattern instanceof RegExp) {
      matched = pattern.test(allText);
    } else if (Array.isArray(pattern)) {
      matched = pattern.some(p => allText.includes(p));
    }

    if (matched) {
      scores[category] = (scores[category] || 0) + priority;
      console.log(`📸 Pattern match: "${pattern}" -> "${category}" (priority: ${priority})`);
    }
  }

  // Find the highest scoring category
  const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    const [bestCategory, bestScore] = sortedCategories[0];
    console.log(`📸 Best match: "${bestCategory}" with score ${bestScore}`);
    if (FALLBACK_IMAGES[bestCategory]) {
      return FALLBACK_IMAGES[bestCategory];
    }
  }

  // Direct category name match as last resort
  for (const [key, images] of Object.entries(FALLBACK_IMAGES)) {
    if (normalizedCategory === key || normalizedCategory.includes(key)) {
      console.log(`📸 Direct category match: "${key}"`);
      return images;
    }
  }

  console.log('📸 No match found, using default images');
  return FALLBACK_IMAGES.default;
}

/**
 * Get search terms for a business category
 */
function getSearchTerms(category: string): string[] {
  const normalizedCategory = category.toLowerCase();

  // Try to find exact match
  if (CATEGORY_SEARCH_TERMS[normalizedCategory]) {
    return CATEGORY_SEARCH_TERMS[normalizedCategory];
  }

  // Try to find partial match
  for (const [key, terms] of Object.entries(CATEGORY_SEARCH_TERMS)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return terms;
    }
  }

  // Return default terms
  return CATEGORY_SEARCH_TERMS.default;
}

/**
 * Fetch images from Unsplash API
 */
export async function fetchUnsplashImages(
  query: string,
  count: number = 6,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not configured, using placeholder images');
    return [];
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', count.toString());
    url.searchParams.set('orientation', orientation);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, await response.text());
      return [];
    }

    const data: UnsplashSearchResponse = await response.json();

    // Return regular quality URLs (1080px width)
    return data.results.map(img => img.urls.regular);
  } catch (error) {
    console.error('Failed to fetch Unsplash images:', error);
    return [];
  }
}

/**
 * Get stock images for a business category
 * Returns multiple images for gallery, hero, services, etc.
 * Falls back to curated direct URLs if API key is not configured
 */
export async function getStockImagesForCategory(
  category: string,
  services: string[] = []
): Promise<{
  hero: string | null;
  gallery: string[];
  services: string[];
}> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  // If no API key, use fallback direct URLs (no API required)
  if (!accessKey) {
    console.log('📸 Using fallback Unsplash images (no API key)');
    const fallback = getFallbackImages(category, services);
    return {
      hero: fallback.hero,
      gallery: fallback.gallery,
      services: fallback.gallery.slice(0, services.length || 4),
    };
  }

  const searchTerms = getSearchTerms(category);

  try {
    // Fetch hero image using primary search term
    const heroImages = await fetchUnsplashImages(searchTerms[0], 1, 'landscape');
    const hero = heroImages[0] || null;

    // Fetch gallery images using multiple search terms
    const galleryPromises = searchTerms.slice(0, 3).map(term =>
      fetchUnsplashImages(term, 2, 'landscape')
    );
    const galleryResults = await Promise.all(galleryPromises);
    const gallery = galleryResults.flat().slice(0, 6);

    // Fetch service-specific images
    const serviceImages: string[] = [];
    for (const service of services.slice(0, 4)) {
      const serviceQuery = `${service} ${category}`;
      const images = await fetchUnsplashImages(serviceQuery, 1, 'landscape');
      if (images[0]) {
        serviceImages.push(images[0]);
      }
    }

    // If API calls failed or returned empty, fall back to curated images
    if (!hero && gallery.length === 0) {
      console.log('📸 API returned no results, using fallback images');
      const fallback = getFallbackImages(category, services);
      return {
        hero: fallback.hero,
        gallery: fallback.gallery,
        services: fallback.gallery.slice(0, services.length || 4),
      };
    }

    return {
      hero,
      gallery,
      services: serviceImages,
    };
  } catch (error) {
    console.error('Failed to get stock images from API, using fallbacks:', error);
    const fallback = getFallbackImages(category, services);
    return {
      hero: fallback.hero,
      gallery: fallback.gallery,
      services: fallback.gallery.slice(0, services.length || 4),
    };
  }
}

/**
 * Get a single stock image for a specific query
 */
export async function getStockImage(query: string): Promise<string | null> {
  const images = await fetchUnsplashImages(query, 1);
  return images[0] || null;
}

export default {
  fetchUnsplashImages,
  getStockImagesForCategory,
  getStockImage,
};
