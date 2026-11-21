import prisma from '../config/db.js';
import { serializeProduct, serializeTaxon, resolveIncoming } from '../lib/media.js';

const RELATIONS = { category: true, brand: true, gamme: true };

// List views never need the gallery (it can be heavy): only the main image travels
const LIST_SELECT = {
  id: true, ref: true, name: true, description: true, priceSold: true, promotionPercentage: true,
  quantity: true, inStock: true, rating: true, image: true, tag: true, details: true, sizes: true,
  colors: true, positives: true, negatives: true, categoryId: true, brandId: true, gammeId: true,
  createdAt: true, updatedAt: true, category: true, brand: true, gamme: true,
};

const toList = (rows, opts) => rows.map((p) => serializeProduct(p, opts));

export const getFilteredProducts = async (filters) => {
  const { category, brand, gamme, search, minPrice, maxPrice, sort, tag, limit } = filters;

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
  if (tag && ['BEST_SELLER', 'NEW', 'TRENDING', 'SALE'].includes(String(tag).toUpperCase())) {
    where.tag = String(tag).toUpperCase();
  }
  if (minPrice || maxPrice) {
    where.priceSold = {};
    if (minPrice) where.priceSold.gte = parseFloat(minPrice);
    if (maxPrice) where.priceSold.lte = parseFloat(maxPrice);
  }

  let orderBy = { id: 'desc' }; // Default sort
  if (sort === 'price_asc' || sort === 'price-asc') orderBy = { priceSold: 'asc' };
  if (sort === 'price_desc' || sort === 'price-desc') orderBy = { priceSold: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  const take = Number.parseInt(limit, 10);
  const rows = await prisma.product.findMany({
    where,
    orderBy,
    select: LIST_SELECT,
    ...(take > 0 ? { take: Math.min(take, 100) } : {}),
  });
  return toList(rows);
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: RELATIONS,
  });
  if (!product) throw new Error('Product not found.');
  return serializeProduct(product);
};

export const getCategories = async () => {
  const rows = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  return rows.map(serializeTaxon('category'));
};

export const getBrands = async () => {
  const rows = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  return rows.map(serializeTaxon('brand'));
};

export const getGammes = async () => {
  const rows = await prisma.gamme.findMany({
    orderBy: { name: 'asc' },
    include: {
      brand: true,
      category: true,
      _count: { select: { products: true } },
    },
  });
  return rows.map(serializeTaxon('gamme'));
};

// Admin services
export const getAllProductsAdmin = async () => {
  const rows = await prisma.product.findMany({
    include: RELATIONS,
    orderBy: { id: 'desc' },
  });
  return toList(rows, { admin: true });
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

  const created = await prisma.product.create({
    include: RELATIONS,
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
  return serializeProduct(created, { admin: true });
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

  // URLs handed out by the media route map back to the stored images
  const nextImage = image ? resolveIncoming(image, 'product', current) : image;
  const nextImages = Array.isArray(images) ? images.map((img) => resolveIncoming(img, 'product', current)) : images;

  // Validate reference uniqueness if changed
  if (ref && ref !== current.ref) {
    const existing = await prisma.product.findUnique({ where: { ref } });
    if (existing) {
      throw new Error(`Product reference '${ref}' is already in use.`);
    }
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    include: RELATIONS,
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
      image: nextImage || undefined,
      images: nextImages || undefined,
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
  return serializeProduct(updated, { admin: true });
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
  if (!data.name || !String(data.name).trim()) throw new Error('Category name is required.');
  const created = await prisma.category.create({
    data: {
      name: data.name,
      parentCategory: data.parentCategory || null,
      image: data.image || null
    }
  });
  return serializeTaxon('category')(created);
};

export const updateCategory = async (id, data) => {
  const current = await prisma.category.findUnique({ where: { id: parseInt(id) } });
  if (!current) throw new Error('Category not found.');
  const updated = await prisma.category.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      parentCategory: data.parentCategory !== undefined ? data.parentCategory : undefined,
      image: data.image !== undefined ? resolveIncoming(data.image, 'category', current) : undefined
    }
  });
  return serializeTaxon('category')(updated);
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id: parseInt(id) }
  });
};

// Brands CRUD
export const createBrand = async (data) => {
  if (!data.name || !String(data.name).trim()) throw new Error('Brand name is required.');
  const created = await prisma.brand.create({
    data: {
      name: data.name,
      origin: data.origin || null,
      image: data.image || null
    }
  });
  return serializeTaxon('brand')(created);
};

export const updateBrand = async (id, data) => {
  const current = await prisma.brand.findUnique({ where: { id: parseInt(id) } });
  if (!current) throw new Error('Brand not found.');
  const updated = await prisma.brand.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      origin: data.origin !== undefined ? data.origin : undefined,
      image: data.image !== undefined ? resolveIncoming(data.image, 'brand', current) : undefined
    }
  });
  return serializeTaxon('brand')(updated);
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

  const created = await prisma.gamme.create({
    data: {
      name: data.name,
      brandId,
      categoryId,
      image: data.image || null
    },
    include: { brand: true, category: true },
  });
  return serializeTaxon('gamme')(created);
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

  const current = await prisma.gamme.findUnique({ where: { id: parseInt(id) } });
  if (!current) throw new Error('Range not found.');
  const updated = await prisma.gamme.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name || undefined,
      brandId: brandId || undefined,
      categoryId: categoryId || undefined,
      image: data.image !== undefined ? resolveIncoming(data.image, 'gamme', current) : undefined
    },
    include: { brand: true, category: true },
  });
  return serializeTaxon('gamme')(updated);
};

export const deleteGamme = async (id) => {
  return await prisma.gamme.delete({
    where: { id: parseInt(id) }
  });
};
