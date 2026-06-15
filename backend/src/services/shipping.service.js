import prisma from '../config/db.js';

export const getTerritories = async () => {
  const rates = await prisma.shippingRate.findMany({
    where: { isActive: true },
    include: {
      communes: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { wilayaCode: 'asc' },
  });

  return rates.map((rate) => ({
    code: rate.wilayaCode,
    name: rate.wilayaName,
    name_ar: rate.wilayaNameAr,
    home_price: Number(rate.homePrice),
    desk_price: Number(rate.deskPrice),
    home_active: rate.homeActive,
    desk_active: rate.deskActive,
    communes: rate.communes.map((c) => ({
      id: c.id,
      name: c.name,
      name_ar: c.nameAr,
      post_code: c.postCode,
    })),
  }));
};

export const getRatesAdmin = async () => {
  const rates = await prisma.shippingRate.findMany({
    orderBy: { wilayaCode: 'asc' },
  });

  return rates.map((rate) => ({
    id: rate.id,
    code: rate.wilayaCode,
    wilaya_code: rate.wilayaCode,
    wilaya: rate.wilayaName,
    wilaya_ar: rate.wilayaNameAr,
    home: Number(rate.homePrice),
    desk: Number(rate.deskPrice),
    is_active: rate.isActive,
    home_active: rate.homeActive,
    desk_active: rate.deskActive,
  }));
};

export const bulkUpdateRates = async (ratesData) => {
  return await prisma.$transaction(async (tx) => {
    for (const rateData of ratesData) {
      await tx.shippingRate.update({
        where: { id: Number(rateData.id) },
        data: {
          homePrice: rateData.home_price !== undefined ? rateData.home_price : rateData.home,
          deskPrice: rateData.desk_price !== undefined ? rateData.desk_price : rateData.desk,
          isActive: rateData.is_active !== undefined ? rateData.is_active : rateData.isActive,
          homeActive: rateData.home_active !== undefined ? rateData.home_active : rateData.homeActive,
          deskActive: rateData.desk_active !== undefined ? rateData.desk_active : rateData.deskActive,
        },
      });
    }

    const updated = await tx.shippingRate.findMany({
      orderBy: { wilayaCode: 'asc' },
    });

    return updated.map((rate) => ({
      id: rate.id,
      code: rate.wilayaCode,
      wilaya_code: rate.wilayaCode,
      wilaya: rate.wilayaName,
      wilaya_ar: rate.wilayaNameAr,
      home: Number(rate.homePrice),
      desk: Number(rate.deskPrice),
      is_active: rate.isActive,
      home_active: rate.homeActive,
      desk_active: rate.deskActive,
    }));
  });
};
