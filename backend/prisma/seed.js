import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.systemSettings.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.gamme.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.commune.deleteMany({});
  await prisma.shippingRate.deleteMany({});

  // 2. Create system settings
  await prisma.systemSettings.create({
    data: {
      id: 1,
      minFreeDelivery: 15000.00,
      deliveryApiKey: 'dummy_delivery_key',
      metaPixelId: 'dummy_meta_pixel_id',
    },
  });

  // 3. Create Users (Admin & Client)
  const adminPasswordHash = await bcrypt.hash('admin123456', 10);
  const clientPasswordHash = await bcrypt.hash('client123456', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin ElectroHub',
      email: 'admin@electrohub.dz',
      phone: '0550112233',
      company: 'ElectroHub HQ',
      wilaya: 'Algiers (16)',
      commune: 'Hydra',
      approved: true,
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
  });

  const client = await prisma.user.create({
    data: {
      fullName: 'Younes Coder',
      email: 'younes.coder@electrohub.dz',
      phone: '0550123456',
      company: 'ElectroTech Solutions DZ',
      wilaya: 'Algiers (16)',
      commune: 'Hydra',
      approved: true,
      role: 'CLIENT',
      passwordHash: clientPasswordHash,
    },
  });

  console.log(`Created users: Admin (${admin.email}), Client (${client.email})`);

  // 4. Create Categories
  const categoriesData = [
    { name: 'distribution', parentCategory: 'Electrical Equipment', image: '/c1.jpg' },
    { name: 'smart', parentCategory: 'Smart Home', image: '/c2.jpg' },
    { name: 'cabling', parentCategory: 'Electrical Equipment', image: '/c3.jpg' },
    { name: 'renewable', parentCategory: 'Energy & Power', image: '/c4.jpg' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created;
  }
  console.log('Created categories:', Object.keys(categories));

  // 5. Create Brands
  const brandsData = [
    { name: 'SIEMENS', origin: 'Germany', image: '/b1.jpg' },
    { name: 'SCHNEIDER', origin: 'France', image: '/b2.jpg' },
    { name: 'LEGRAND', origin: 'France', image: '/b3.jpg' },
    { name: 'ABB', origin: 'Switzerland', image: '/b4.jpg' },
    { name: 'EATON', origin: 'USA', image: '/b5.jpg' },
    { name: 'PHILIPS', origin: 'Netherlands', image: '/b6.jpg' },
  ];

  const brands = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    brands[b.name] = created;
  }
  console.log('Created brands:', Object.keys(brands));

  // 6. Create Gammes (Optional collections/ranges)
  const gammesData = [
    { name: 'Pro', brand: 'SIEMENS', category: 'distribution' },
    { name: 'Classic', brand: 'SCHNEIDER', category: 'smart' },
    { name: 'Elite', brand: 'LEGRAND', category: 'cabling' },
  ];

  const gammes = {};
  for (const g of gammesData) {
    const brandId = brands[g.brand].id;
    const categoryId = categories[g.category].id;
    const created = await prisma.gamme.create({
      data: {
        name: g.name,
        brandId,
        categoryId,
      },
    });
    gammes[g.name] = created;
  }
  console.log('Created gammes');

  // 7. Create Products
  const productsSource = [
    {
      ref: 'REF-S1-098',
      name: 'Smart Circuit Breaker Pro',
      priceSold: 38500,
      priceBought: 28000,
      promotionPercentage: 14.44,
      image: '/p1.jpg',
      images: ['/p1.jpg', '/bg1.jpg', '/product-2.png'],
      tag: 'BEST_SELLER',
      category: 'distribution',
      brand: 'SIEMENS',
      gamme: 'Pro',
      inStock: true,
      rating: 4.9,
      quantity: 50,
      description: 'A state-of-the-art smart circuit breaker designed for comprehensive residential and commercial grid management. Featuring remote power tracking, sub-millisecond fault detection, and seamless cloud integration for optimal energy efficiency and absolute safety.',
      details: [
        'Advanced water & dust resistant housing',
        'IoT-enabled remote control & scheduling',
        'Real-time voltage, current & leakage diagnostics',
        'ISO9001 and CE certified components',
      ],
      sizes: ['16A', '32A', '63A', '100A'],
      colors: [
        { name: 'Tech Matte White', hex: '#F3F4F6' },
        { name: 'Industrial Gray', hex: '#4B5563' },
      ],
      positives: [
        'Remote power tracking via Wi-Fi/Cloud app',
        'Sub-millisecond fault detection & cutoff',
        'Easy DIN rail installation in standard boards',
        'CE & ISO9001 safety certified'
      ],
      negatives: [
        'Requires stable internet connection for smart features',
        'Higher upfront price compared to standard breakers'
      ]
    },
    {
      ref: 'REF-S2-763',
      name: 'Intelligent Energy Monitor',
      priceSold: 18900,
      priceBought: 14000,
      promotionPercentage: 0.0,
      image: '/p2.jpg',
      images: ['/p2.jpg', '/bg2.jpg', '/product-3.png'],
      tag: 'NEW',
      category: 'smart',
      brand: 'SCHNEIDER',
      gamme: 'Classic',
      inStock: true,
      rating: 4.8,
      quantity: 35,
      description: "Get absolute transparency over your building's electricity usage. The Intelligent Energy Monitor hooks directly into your distribution board to track real-time consumption trends, identify high-load devices, and deliver AI-powered energy-saving recommendations straight to your smartphone.",
      details: [
        'Precision micro-sensors for non-invasive clamping',
        'Sub-second consumption refresh rate',
        'Supports single-phase and three-phase grids',
        'Secure 256-bit SSL cloud storage connection',
      ],
      sizes: ['Single-Phase', 'Three-Phase'],
      colors: [
        { name: 'Midnight Onyx', hex: '#111827' },
        { name: 'Polar Ice Blue', hex: '#E0F2FE' },
      ],
      positives: [
        'Real-time, sub-second consumption tracking',
        'AI-powered device recognition & savings advice',
        'Dual grid compatibility (Single & Three-Phase)',
        'Non-invasive clamp installation (no wire cutting)'
      ],
      negatives: [
        'Sensor clamps require clean, open panel wiring',
        'Advanced historical analytics require app account sync'
      ]
    },
    {
      ref: 'REF-S3-452',
      name: 'Heavy Duty Copper Cable',
      priceSold: 14500,
      priceBought: 10000,
      promotionPercentage: 0.0,
      image: '/p3.jpg',
      images: ['/p3.jpg', '/bg1.jpg', '/product-4.png'],
      tag: 'TRENDING',
      category: 'cabling',
      brand: 'LEGRAND',
      gamme: 'Elite',
      inStock: true,
      rating: 4.7,
      quantity: 120,
      description: 'High-conductivity flame-retardant multi-core copper wiring designed for high-stress industrial machinery, main supply lines, and solar grid hookups. Built to handle extreme temperatures without performance degradation.',
      details: [
        '99.9% pure electrolyte-grade copper cores',
        'Double PVC protective outer sheath',
        'Flame retardant & zero halogen emissions',
        'Highly flexible and easy to pull through conduits',
      ],
      sizes: ['4mm²', '6mm²', '10mm²', '16mm²'],
      colors: [
        { name: 'Standard Black', hex: '#000000' },
        { name: 'Safety Red', hex: '#EF4444' },
      ],
      positives: [
        '99.9% pure electrolyte copper for maximum conductivity',
        'Dual PVC outer sheath protects against moisture/abrasion',
        'Flame-retardant standard with low toxic smoke emissions',
        'Excellent bending radius and general flexibility'
      ],
      negatives: [
        'Heavier shipping weight adds to transport expenses',
        'Price fluctuates dynamically with global copper markets'
      ]
    },
    {
      ref: 'REF-S4-102',
      name: 'Premium Double Wall Switch',
      priceSold: 9500,
      priceBought: 7000,
      promotionPercentage: 20.83,
      image: '/p4.jpg',
      images: ['/p4.jpg', '/bg2.jpg', '/product-1.png'],
      tag: 'SALE',
      category: 'cabling',
      brand: 'LEGRAND',
      gamme: 'Elite',
      inStock: true,
      rating: 4.6,
      quantity: 80,
      description: 'Architectural dual wall switches crafted from anodized brushed aluminum. Combines tactile spring-back switches with built-in surge protection and subtle LED indicator halos that look stunning in luxury offices and smart homes.',
      details: [
        'Premium brushed aluminum faceplate',
        'Tactile mechanical feedback with premium click',
        'Subtle cyan halo backlight indicating active state',
        'Scratch-resistant & anti-fingerprint coating',
      ],
      sizes: ['Standard 86mm', 'Double 146mm'],
      colors: [
        { name: 'Anodized Silver', hex: '#D1D5DB' },
        { name: 'Midnight Charcoal', hex: '#1F2937' },
      ],
      positives: [
        'Stunning anodized aluminum faceplate aesthetics',
        'Extremely tactile mechanical switches with subtle cyan glow',
        'Integrated micro-surge suppression',
        'Anti-fingerprint matte coating keeps it looking clean'
      ],
      negatives: [
        'Requires standard deep wall mounting boxes',
        'Backlight can be slightly bright in very dark bedrooms'
      ]
    },
    {
      ref: 'REF-S5-891',
      name: 'Solar Panel 450W Mono',
      priceSold: 42000,
      priceBought: 31000,
      promotionPercentage: 0.0,
      image: '/bg1.jpg',
      images: ['/bg1.jpg', '/product-2.png', '/product-3.png'],
      tag: 'TRENDING',
      category: 'renewable',
      brand: 'SIEMENS',
      gamme: null,
      inStock: true,
      rating: 4.9,
      quantity: 40,
      description: 'Monocrystalline high-efficiency photovoltaic panels with heavy weathering tolerance and advanced cell bypass technology to maximize generation even under partial shade.',
      details: [
        'Grade-A monocrystalline silicon structure',
        'Advanced bypass diodes to reduce shade loss',
        'Anodized aluminum anti-corrosion frame',
        'Certified mechanical load up to 5400Pa',
      ],
      sizes: ['Standard'],
      colors: [
        { name: 'All-Black Stealth', hex: '#1A1A1A' }
      ],
      positives: [
        'Leading 21.2% solar conversion efficiency rate',
        'Robust bypass diodes minimize power drop under partial shading',
        'Withstands heavy snow loads (5400Pa) and wind speeds (2400Pa)',
        'Long-term 25-year linear performance warranty'
      ],
      negatives: [
        'Large physical footprint requires multi-person installation',
        'Requires separate charge controller and mount brackets'
      ]
    },
    {
      ref: 'REF-S6-654',
      name: 'Lithium Battery Storage 5kWh',
      priceSold: 245000,
      priceBought: 180000,
      promotionPercentage: 12.5,
      image: '/bg2.jpg',
      images: ['/bg2.jpg', '/product-1.png', '/product-4.png'],
      tag: 'BEST_SELLER',
      category: 'renewable',
      brand: 'ABB',
      gamme: null,
      inStock: true,
      rating: 5.0,
      quantity: 15,
      description: 'High discharge life smart lithium iron phosphate home battery cells. Complete with intelligent battery management system (BMS) and modular expansion capabilities.',
      details: [
        'Safe LiFePO4 chemistry with thermal runaway guard',
        'Integrated smart BMS with CAN/RS485 interfaces',
        'Wall mountable space-saving configuration',
        'Supports up to 4 units in parallel expansion',
      ],
      sizes: ['5kWh Cabinet', '10kWh Cabinet'],
      colors: [
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Titanium Grey', hex: '#707070' }
      ],
      positives: [
        'Ultra-safe LiFePO4 chemical composition (no fire risk)',
        'Exceptional lifecycle of over 6,000 charge cycles',
        'Modular configuration supports easy capacity expansion',
        'Integrated BMS monitors cell health, voltage, & temp'
      ],
      negatives: [
        'Significant initial capital expenditure required',
        'Heavy net weight (48kg) requires solid concrete wall support'
      ]
    },
    {
      ref: 'REF-S7-321',
      name: 'Smart Wi-Fi Meter Pro',
      priceSold: 12800,
      priceBought: 9500,
      promotionPercentage: 0.0,
      image: '/product-1.png',
      images: ['/product-1.png', '/p2.jpg', '/product-2.png'],
      tag: 'NEW',
      category: 'smart',
      brand: 'SCHNEIDER',
      gamme: 'Classic',
      inStock: false,
      rating: 4.5,
      quantity: 0,
      description: 'Intelligent wireless utility tracker syncing real-time voltage stats over standard MQTT, ideal for home automation enthusiasts and industrial tracking networks.',
      details: [
        'Compact 35mm DIN rail mounting profile',
        'Open MQTT & HTTP API integrations',
        'External antenna connector for metal cabinets',
        'Over-current and over-voltage alert relays',
      ],
      sizes: ['Single-Phase'],
      colors: [
        { name: 'Light Industrial Grey', hex: '#E5E7EB' }
      ],
      positives: [
        'Open-source integration capabilities (MQTT/Home Assistant)',
        'Extremely compact size fits in any standard circuit board',
        'Includes high-gain external antenna for metallic boxes',
        'Class 1.0 energy calculation precision'
      ],
      negatives: [
        'Does not support physical manual toggle on/off',
        'Currently limited to single-phase installation setups'
      ]
    },
    {
      ref: 'REF-S8-219',
      name: 'Industrial Contactor 40A',
      priceSold: 15400,
      priceBought: 11000,
      promotionPercentage: 0.0,
      image: '/product-2.png',
      images: ['/product-2.png', '/p3.jpg', '/product-3.png'],
      tag: 'NONE',
      category: 'distribution',
      brand: 'ABB',
      gamme: null,
      inStock: true,
      rating: 4.7,
      quantity: 25,
      description: 'Heavy duty modular power contactor for commercial pump systems, ventilation control, and high-current resistive heating elements. Built for millions of mechanical actions.',
      details: [
        'Silver alloy contact points to prevent arcing',
        'Low power consumption hum-free solenoid coil',
        'Built-in auxiliary contact configuration (1NO + 1NC)',
        'Complies with IEC/EN 60947 standards',
      ],
      sizes: ['220V Coil', '380V Coil'],
      colors: [
        { name: 'Factory Slate', hex: '#374151' }
      ],
      positives: [
        'Silver-alloy contacts prevent electric arcing & welds',
        'Auxiliary contacts (1NO + 1NC) included as standard',
        'Extremely long life (exceeds 10 million cycles)',
        'Hum-free coil technology ensures silent operation'
      ],
      negatives: [
        'Loud mechanical click noise when latching or releasing',
        'Requires separate thermal overload relay for full motor protection'
      ]
    },
    {
      ref: 'REF-S9-432',
      name: 'Surge Protection Device',
      priceSold: 8900,
      priceBought: 6500,
      promotionPercentage: 0.0,
      image: '/product-3.png',
      images: ['/product-3.png', '/p4.jpg', '/product-4.png'],
      tag: 'SALE',
      category: 'distribution',
      brand: 'EATON',
      gamme: null,
      inStock: true,
      rating: 4.8,
      quantity: 60,
      description: 'Class II transient voltage surge protective device safeguarding computer networks, industrial control units, and luxury appliance grids from lightning and power spikes.',
      details: [
        'Fast-acting Metal Oxide Varistor (MOV) tech',
        'Pluggable replacement cartridges with window indicator',
        'Response time under 25 nanoseconds',
        'Visual health alert flags (Green = Good, Red = Replace)',
      ],
      sizes: ['20kA', '40kA'],
      colors: [
        { name: 'Safety Orange', hex: '#F97316' }
      ],
      positives: [
        'Cartridges can be swapped without powering off the board',
        'Ultra-fast response time (sub-25ns) catches quick spikes',
        'High surge discharge capacity (up to 40kA rating)',
        'Clear mechanical flag display for replacement status'
      ],
      negatives: [
        'Sacrificial component - must be replaced after major surges',
        'Crucially depends on high-quality low-resistance grounding'
      ]
    },
    {
      ref: 'REF-S10-546',
      name: 'Solar Grid-Tie Inverter 5kW',
      priceSold: 189000,
      priceBought: 140000,
      promotionPercentage: 0.0,
      image: '/product-4.png',
      images: ['/product-4.png', '/bg1.jpg', '/product-1.png'],
      tag: 'NONE',
      category: 'renewable',
      brand: 'PHILIPS',
      gamme: null,
      inStock: false,
      quantity: 0,
      description: 'State-of-the-art dual-MPPT smart grid-tie inverter featuring advanced convection fanless cooling and detailed cloud-based generation logging.',
      details: [
        'Dual MPPT inputs to optimize multi-angle panels',
        'Silent convection cooling system (fanless design)',
        'IP65 dustproof and waterproof rated design',
        'Integrated DC switch for safe isolate maintenance',
      ],
      sizes: ['5kW Wall-Mount'],
      colors: [
        { name: 'Brushed Aluminium', hex: '#9CA3AF' }
      ],
      positives: [
        'Dual-MPPT trackers maximize yields on complex split roofs',
        'Fanless heat-sink structure for completely silent running',
        'IP65 enclosure enables both indoor and outdoor mounts',
        'Integrated DC isolator switch for emergency manual shutoff'
      ],
      negatives: [
        'Requires professional electrical grid inspection before hookup',
        'Does not support backup power (EPS) mode in grid outages'
      ]
    }
  ];

  for (const prod of productsSource) {
    const categoryId = categories[prod.category].id;
    const brandId = brands[prod.brand].id;
    const gammeId = prod.gamme ? gammes[prod.gamme].id : null;

    await prisma.product.create({
      data: {
        ref: prod.ref,
        name: prod.name,
        description: prod.description,
        priceBought: prod.priceBought,
        priceSold: prod.priceSold,
        promotionPercentage: prod.promotionPercentage,
        quantity: prod.quantity,
        inStock: prod.quantity > 0,
        rating: prod.rating,
        image: prod.image,
        images: prod.images,
        tag: prod.tag,
        details: prod.details,
        sizes: prod.sizes,
        colors: prod.colors,
        positives: prod.positives,
        negatives: prod.negatives,
        categoryId,
        brandId,
        gammeId,
      },
    });
  }

  console.log('Seeded products successfully.');

  // 7. Seed Shipping Rates & Communes
  console.log('Seeding shipping rates and communes...');
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const wilayasPath = path.join(__dirname, 'data', 'Wilaya_Of_Algeria.json');
  const communesPath = path.join(__dirname, 'data', 'Commune_Of_Algeria.json');

  if (fs.existsSync(wilayasPath) && fs.existsSync(communesPath)) {
    const wilayas = JSON.parse(fs.readFileSync(wilayasPath, 'utf-8'));
    const communes = JSON.parse(fs.readFileSync(communesPath, 'utf-8'));

    console.log(`Seeding ${wilayas.length} wilayas...`);
    const wilayaMap = {};

    for (const w of wilayas) {
      const paddedCode = String(w.code).padStart(2, '0');
      let homePrice = 800;
      let deskPrice = 600;

      switch (paddedCode) {
        case '16': // Alger
          homePrice = 400;
          deskPrice = 200;
          break;
        case '09': // Blida
        case '35': // Boumerdes
        case '42': // Tipaza
          homePrice = 450;
          deskPrice = 250;
          break;
        case '02': // Chlef
        case '31': // Oran
          homePrice = 600;
          deskPrice = 400;
          break;
        case '06': // Bejaia
        case '15': // Tizi Ouzou
          homePrice = 700;
          deskPrice = 450;
          break;
        case '25': // Constantine
          homePrice = 750;
          deskPrice = 500;
          break;
        case '23': // Annaba
          homePrice = 800;
          deskPrice = 550;
          break;
        case '47': // Ghardaia
          homePrice = 1000;
          deskPrice = 700;
          break;
        case '39': // El Oued
          homePrice = 1100;
          deskPrice = 750;
          break;
        case '01': // Adrar
        case '33': // Illizi
        case '37': // Tindouf
          homePrice = 1200;
          deskPrice = 800;
          break;
      }

      let nameFr = w.name;
      if (paddedCode === '19') nameFr = 'Sétif';
      if (paddedCode === '20') nameFr = 'Saïda';
      if (paddedCode === '47') nameFr = 'Ghardaïa';

      const rate = await prisma.shippingRate.create({
        data: {
          wilayaCode: paddedCode,
          wilayaName: nameFr,
          wilayaNameAr: w.ar_name,
          homePrice: homePrice,
          deskPrice: deskPrice,
          isActive: true,
          homeActive: true,
          deskActive: true,
        },
      });
      wilayaMap[w.id] = rate.id;
    }

    console.log(`Seeding ${communes.length} communes...`);
    const communeData = [];
    for (const c of communes) {
      const dbWilayaId = wilayaMap[c.wilaya_id];
      if (dbWilayaId) {
        communeData.push({
          shippingRateId: dbWilayaId,
          name: c.name,
          nameAr: c.ar_name,
          postCode: c.post_code ? String(c.post_code) : null,
        });
      }
    }

    // Chunk insert communes to avoid Postgres/Prisma limits in bulk insert
    const chunkSize = 200;
    for (let i = 0; i < communeData.length; i += chunkSize) {
      const chunk = communeData.slice(i, i + chunkSize);
      await prisma.commune.createMany({
        data: chunk,
      });
    }

    console.log('Seeded shipping rates and communes successfully.');
  } else {
    console.warn('Wilaya/Commune JSON files not found. Skipping shipping rates seed.');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
