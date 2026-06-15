import prisma from '../config/db.js';

export const getFilteredProducts = async (filters) => {
  const { category, brand, gamme, search, minPrice, maxPrice, sort } = filters;

  const where = { inStock: true };

  if (category) {
    where.category = { name: { equals: category, mode: 'insensitive' } };
  }
  if (brand) {
    where.brand = { name: { equals: brand, mode: 'insensitive' } };
  }
  if (gamme) {
    where.gamme = { name: { equals: gamme, mode: 'insensitive' } };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { ref: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (minPrice || maxPrice) {
    where.priceSold = {};
    if (minPrice) where.priceSold.gte = parseFloat(minPrice);
    if (maxPrice) where.priceSold.lte = parseFloat(maxPrice);
  }

  let orderBy = { id: 'desc' }; // Default sort
  if (sort === 'price_asc') orderBy = { priceSold: 'asc' };
  if (sort === 'price_desc') orderBy = { priceSold: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  return await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      brand: true,
      gamme: true,
    },
  });
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      brand: true,
      gamme: true,
    },
  });
  if (!product) throw new Error('Product not found.');
  return product;
};

export const getCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

export const getBrands = async () => {
  return await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
};

export const getGammes = async () => {
  return await prisma.gamme.findMany({
    include: {
      brand: true,
      category: true,
    },
  });
};

// Admin services
export const getAllProductsAdmin = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      gamme: true,
    },
    orderBy: { id: 'desc' },
  });
};

export const createProduct = async (productData) => {
  const {
    ref,
    name,
    description,
    priceBought,
    priceSold,
    promotionPercentage,
    quantity,
    inStock,
    rating,
    image,
    images,
    tag,
    details,
    sizes,
    colors,
    positives,
    negatives,
    categoryId,
    brandId,
    gammeId,
  } = productData;

  // Validate reference uniqueness
  const existing = await prisma.product.findUnique({ where: { ref } });
  if (existing) {
    throw new Error(`Product reference '${ref}' is already in use.`);
  }

  return await prisma.product.create({
    data: {
      ref,
      name,
      description,
      priceBought: parseFloat(priceBought),
      priceSold: parseFloat(priceSold),
      promotionPercentage: parseFloat(promotionPercentage || 0),
      quantity: parseInt(quantity || 0),
      inStock: inStock !== undefined ? inStock : parseInt(quantity || 0) > 0,
      rating: parseFloat(rating || 5.0),
      image,
      images: images || [],
      tag: tag || 'NONE',
      details: details || [],
      sizes: sizes || [],
      colors: colors || [],
      positives: positives || [],
      negatives: negatives || [],
      categoryId: parseInt(categoryId),
      brandId: parseInt(brandId),
      gammeId: gammeId ? parseInt(gammeId) : null,
    },
  });
};

export const updateProduct = async (id, productData) => {
  const productId = parseInt(id);
  const {
    ref,
    name,
    description,
    priceBought,
    priceSold,
    promotionPercentage,
    quantity,
    inStock,
    rating,
    image,
    images,
    tag,
    details,
    sizes,
    colors,
    positives,
    negatives,
    categoryId,
    brandId,
    gammeId,
  } = productData;

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) throw new Error('Product not found.');

  // Validate reference uniqueness if changed
  if (ref && ref !== current.ref) {
    const existing = await prisma.product.findUnique({ where: { ref } });
    if (existing) {
      throw new Error(`Product reference '${ref}' is already in use.`);
    }
  }

  return await prisma.product.update({
    where: { id: productId },
    data: {
      ref: ref || undefined,
      name: name || undefined,
      description: description || undefined,
      priceBought: priceBought !== undefined ? parseFloat(priceBought) : undefined,
      priceSold: priceSold !== undefined ? parseFloat(priceSold) : undefined,
      promotionPercentage: promotionPercentage !== undefined ? parseFloat(promotionPercentage) : undefined,
      quantity: quantity !== undefined ? parseInt(quantity) : undefined,
      inStock: inStock !== undefined ? inStock : (quantity !== undefined ? parseInt(quantity) > 0 : undefined),
      rating: rating !== undefined ? parseFloat(rating) : undefined,
      image: image || undefined,
      images: images || undefined,
      tag: tag || undefined,
      details: details || undefined,
      sizes: sizes || undefined,
      colors: colors || undefined,
      positives: positives || undefined,
      negatives: negatives || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      brandId: brandId ? parseInt(brandId) : undefined,
      gammeId: gammeId !== undefined ? (gammeId ? parseInt(gammeId) : null) : undefined,
    },
  });
};

export const deleteProduct = async (id) => {
  const productId = parseInt(id);
  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) throw new Error('Product not found.');

  // We do a hard delete in this system
  return await prisma.product.delete({
    where: { id: productId },
  });
};

// Categories CRUD
export const createCategory = async (data) => {
  return await prisma.category.create({
    data: {
      name: data.name,
      parentCategory: data.parentCategory || null,
      image: data.image || null
    }
  });
};

export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      parentCategory: data.parentCategory !== undefined ? data.parentCategory : undefined,
      image: data.image !== undefined ? data.image : undefined
    }
  });
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id: parseInt(id) }
  });
};

// Brands CRUD
export const createBrand = async (data) => {
  return await prisma.brand.create({
    data: {
      name: data.name,
      origin: data.origin || null,
      image: data.image || null
    }
  });
};

export const updateBrand = async (id, data) => {
  return await prisma.brand.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      origin: data.origin !== undefined ? data.origin : undefined,
      image: data.image !== undefined ? data.image : undefined
    }
  });
};

export const deleteBrand = async (id) => {
  return await prisma.brand.delete({
    where: { id: parseInt(id) }
  });
};

// Gammes CRUD
export const createGamme = async (data) => {
  let brandId = parseInt(data.brandId);
  if (isNaN(brandId) && data.brand) {
    const brand = await prisma.brand.findUnique({ where: { name: data.brand } });
    if (brand) brandId = brand.id;
  }
  let categoryId = parseInt(data.categoryId);
  if (isNaN(categoryId) && data.category) {
    const category = await prisma.category.findUnique({ where: { name: data.category } });
    if (category) categoryId = category.id;
  }

  if (!brandId || !categoryId) {
    throw new Error('Valid Brand and Category are required to create a Gamme.');
  }

  return await prisma.gamme.create({
    data: {
      name: data.name,
      brandId,
      categoryId,
      image: data.image || null
    }
  });
};

export const updateGamme = async (id, data) => {
  let brandId = data.brandId ? parseInt(data.brandId) : undefined;
  if (brandId === undefined && data.brand) {
    const brand = await prisma.brand.findUnique({ where: { name: data.brand } });
    if (brand) brandId = brand.id;
  }
  let categoryId = data.categoryId ? parseInt(data.categoryId) : undefined;
  if (categoryId === undefined && data.category) {
    const category = await prisma.category.findUnique({ where: { name: data.category } });
    if (category) categoryId = category.id;
  }

  return await prisma.gamme.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      brandId: brandId || undefined,
      categoryId: categoryId || undefined,
      image: data.image !== undefined ? data.image : undefined
    }
  });
};

export const deleteGamme = async (id) => {
  return await prisma.gamme.delete({
    where: { id: parseInt(id) }
  });
};
