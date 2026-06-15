import prisma from '../config/db.js';

export const getPublicSettings = async () => {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
    select: {
      minFreeDelivery: true,
      metaPixelId: true, // safe to expose for pixel tracking in browser
    },
  });

  if (!settings) {
    return { minFreeDelivery: 15000.00, metaPixelId: null };
  }
  return settings;
};

export const getAdminSettings = async () => {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });
  if (!settings) {
    return { id: 1, minFreeDelivery: 15000.00, deliveryApiKey: null, metaPixelId: null };
  }
  return settings;
};

export const updateSettings = async (settingsData) => {
  const { minFreeDelivery, deliveryApiKey, metaPixelId } = settingsData;

  const data = {};
  if (minFreeDelivery !== undefined) data.minFreeDelivery = parseFloat(minFreeDelivery);
  if (deliveryApiKey !== undefined) data.deliveryApiKey = deliveryApiKey;
  if (metaPixelId !== undefined) data.metaPixelId = metaPixelId;

  return await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      minFreeDelivery: minFreeDelivery !== undefined ? parseFloat(minFreeDelivery) : 15000.00,
      deliveryApiKey: deliveryApiKey || null,
      metaPixelId: metaPixelId || null,
    },
  });
};
