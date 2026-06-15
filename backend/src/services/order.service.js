import prisma from '../config/db.js';

// Helper to generate unique EH-YYYY-XXXXX orderId
const generateUniqueOrderId = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let orderId = '';
  
  while (!unique) {
    const random = Math.floor(10000 + Math.random() * 90000); // 5 digits
    orderId = `EH-${year}-${random}`;
    
    const existing = await prisma.order.findUnique({
      where: { orderId }
    });
    if (!existing) {
      unique = true;
    }
  }
  return orderId;
};

// Helper to compute shipping fee based on wilaya
const computeShippingFee = async (wilaya, subtotal, minFreeDelivery, shippingType = 'home') => {
  if (subtotal >= minFreeDelivery) {
    return 0;
  }
  
  const match = wilaya.match(/\((\d+)\)/);
  const code = match ? match[1] : null;

  let rate = null;
  if (code) {
    rate = await prisma.shippingRate.findUnique({
      where: { wilayaCode: code.padStart(2, '0') }
    });
  } else {
    // Fallback search by name
    rate = await prisma.shippingRate.findFirst({
      where: {
        wilayaName: {
          contains: wilaya.replace(/\s*\(\d+\)\s*/g, '').trim(),
          mode: 'insensitive'
        }
      }
    });
  }

  if (rate && rate.isActive) {
    if (shippingType === 'desk' && rate.deskActive) {
      return Number(rate.deskPrice);
    }
    return Number(rate.homePrice);
  }

  const w = wilaya.toLowerCase();
  if (w.includes('algiers') || w.includes('alger') || w.includes('16')) {
    return 400.00;
  } else if (w.includes('blida') || w.includes('09')) {
    return 500.00;
  } else if (w.includes('oran') || w.includes('constantine') || w.includes('31') || w.includes('25')) {
    return 700.00;
  } else {
    return 900.00;
  }
};

export const createOrder = async (orderData, userId = null) => {
  const clientName = orderData.clientName || orderData.fullName;
  const clientPhone = orderData.clientPhone || orderData.phone;
  const {
    clientEmail,
    wilaya,
    commune,
    addressDetails,
    shippingType, // "home" or "desk"
    items // array of { productId, quantity, size, color }
  } = orderData;

  if (!clientName || !clientPhone || !wilaya || !commune || !items || items.length === 0) {
    throw new Error('Required order information is missing.');
  }

  // Fetch current system settings for free delivery limit
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 }
  });
  const minFreeDelivery = settings ? Number(settings.minFreeDelivery) : 15000.00;

  // Start Transaction
  const orderResult = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsWithDetails = [];

    // Validate stock and deduct inventory
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
      }

      // Calculate selling price with promotion percentage if any
      const promoMultiplier = 1 - (Number(product.promotionPercentage) / 100);
      const itemPrice = Number(product.priceSold) * promoMultiplier;
      subtotal += itemPrice * item.quantity;

      // Update product inventory
      const updatedQuantity = product.quantity - item.quantity;
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: updatedQuantity,
          inStock: updatedQuantity > 0
        }
      });

      itemsWithDetails.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.image,
        size: item.size || null,
        color: item.color || null
      });
    }

    const shippingFee = await computeShippingFee(wilaya, subtotal, minFreeDelivery, shippingType || 'home');
    const total = subtotal + shippingFee;
    const orderId = await generateUniqueOrderId();

    // Create the order
    return await tx.order.create({
      data: {
        orderId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || `${clientPhone}@electrohub.dz`,
        wilaya,
        commune,
        addressDetails,
        shippingType: shippingType || 'home',
        shippingFee,
        total,
        status: 'PENDING',
        userId,
        items: {
          create: itemsWithDetails.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color
          }))
        }
      },
      include: {
        items: true
      }
    });
  });

  return orderResult;
};

export const getMyOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: { id: 'desc' }
  });
};

// Admin Services
export const getAllOrdersAdmin = async () => {
  return await prisma.order.findMany({
    include: {
      items: true,
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          company: true,
          approved: true
        }
      }
    },
    orderBy: { id: 'desc' }
  });
};

export const updateOrderStatus = async (id, status) => {
  const orderIdVal = Number.parseInt(id, 10);
  const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : status;
  const current = Number.isNaN(orderIdVal)
    ? await prisma.order.findUnique({
        where: { orderId: id },
        include: { items: true }
      })
    : await prisma.order.findUnique({
        where: { id: orderIdVal },
        include: { items: true }
      });
  if (!current) throw new Error('Order not found.');

  // If status transitions from CANCELLED back to something else, or to CANCELLED, we may restore stock
  // Let's implement stock restoration if transition to CANCELLED
  if (normalizedStatus === 'CANCELLED' && current.status !== 'CANCELLED') {
    await prisma.$transaction(async (tx) => {
      for (const item of current.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const updatedQuantity = product.quantity + item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: updatedQuantity,
                inStock: updatedQuantity > 0
              }
            });
          }
        }
      }
    });
  }

  return await prisma.order.update({
    where: Number.isNaN(orderIdVal) ? { orderId: id } : { id: orderIdVal },
    data: { status: normalizedStatus },
    include: { items: true }
  });
};

// Dashboard Stats Service
export const getDashboardStats = async () => {
  // Confirm/Shipped/Delivered orders represent actual orders for revenue
  const revenueOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ['CONFIRMED', 'SHIPPED', 'DELIVERED']
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  const pendingOrdersCount = await prisma.order.count({
    where: { status: 'PENDING' }
  });

  const totalOrdersCount = await prisma.order.count();

  let totalRevenue = 0;
  let profitMade = 0;

  revenueOrders.forEach((order) => {
    // Total revenue is sum of order total minus shipping fee
    const orderRevenue = Number(order.total) - Number(order.shippingFee);
    totalRevenue += orderRevenue;

    // Profit = (selling_price - cost_price) * quantity
    order.items.forEach((item) => {
      const soldPrice = Number(item.price);
      // Fallback to 75% of sold price if product was deleted or cost price is null
      const boughtPrice = item.product ? Number(item.product.priceBought) : (soldPrice * 0.75);
      profitMade += (soldPrice - boughtPrice) * item.quantity;
    });
  });

  const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

  return {
    totalRevenue,
    profitMade,
    averageOrderValue,
    pendingOrdersCount,
    totalOrdersCount
  };
};
