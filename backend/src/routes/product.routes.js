import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/gammes', productController.getGammes);
router.get('/:id', productController.getProductById);

// Administrative routes (can be in product.routes.js but mounted as /api/admin/products)
// Let's declare them here for modularity and export them or register them in index.js
export const adminProductRouter = Router();
adminProductRouter.use(authMiddleware, adminMiddleware);

// Categories
adminProductRouter.post('/categories', productController.createCategory);
adminProductRouter.put('/categories/:id', productController.updateCategory);
adminProductRouter.delete('/categories/:id', productController.deleteCategory);

// Brands
adminProductRouter.post('/brands', productController.createBrand);
adminProductRouter.put('/brands/:id', productController.updateBrand);
adminProductRouter.delete('/brands/:id', productController.deleteBrand);

// Gammes
adminProductRouter.post('/gammes', productController.createGamme);
adminProductRouter.put('/gammes/:id', productController.updateGamme);
adminProductRouter.delete('/gammes/:id', productController.deleteGamme);

// Products
adminProductRouter.get('/', productController.getAllProductsAdmin);
adminProductRouter.post('/', productController.createProduct);
adminProductRouter.put('/:id', productController.updateProduct);
adminProductRouter.delete('/:id', productController.deleteProduct);

export default router;
