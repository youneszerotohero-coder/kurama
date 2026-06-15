import { Router } from 'express';
import * as shippingController from '../controllers/shipping.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Public route for frontend checkout
router.get('/territories', shippingController.getTerritories);

// Admin routes for managing rates
export const adminShippingRouter = Router();
adminShippingRouter.use(authMiddleware, adminMiddleware);
adminShippingRouter.get('/rates', shippingController.getRatesAdmin);
adminShippingRouter.patch('/rates', shippingController.bulkUpdateRates);

export default router;
