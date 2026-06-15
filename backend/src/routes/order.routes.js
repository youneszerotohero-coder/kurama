import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Public / client routes
router.post('/', optionalAuthMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

// Administrative routes
export const adminOrderRouter = Router();
adminOrderRouter.use(authMiddleware, adminMiddleware);
adminOrderRouter.get('/', orderController.getAllOrdersAdmin);
adminOrderRouter.put('/:id', orderController.updateOrderStatus);
adminOrderRouter.get('/dashboard/stats', orderController.getDashboardStats);

export default router;
