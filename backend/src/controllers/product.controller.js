import * as productService from '../services/product.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const filters = req.query;
    const products = await productService.getFilteredProducts(filters);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await productService.getBrands();
    return res.status(200).json(brands);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getGammes = async (req, res, next) => {
  try {
    const gammes = await productService.getGammes();
    return res.status(200).json(gammes);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Admin controller handlers
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await productService.getAllProductsAdmin();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await productService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await productService.updateCategory(req.params.id, req.body);
    return res.status(200).json(category);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await productService.deleteCategory(req.params.id);
    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const brand = await productService.createBrand(req.body);
    return res.status(201).json(brand);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await productService.updateBrand(req.params.id, req.body);
    return res.status(200).json(brand);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await productService.deleteBrand(req.params.id);
    return res.status(200).json({ message: 'Brand deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createGamme = async (req, res, next) => {
  try {
    const gamme = await productService.createGamme(req.body);
    return res.status(201).json(gamme);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateGamme = async (req, res, next) => {
  try {
    const gamme = await productService.updateGamme(req.params.id, req.body);
    return res.status(200).json(gamme);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteGamme = async (req, res, next) => {
  try {
    await productService.deleteGamme(req.params.id);
    return res.status(200).json({ message: 'Gamme deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
