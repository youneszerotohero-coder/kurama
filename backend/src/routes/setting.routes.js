import { Router } from 'express';
import * as settingController from '../controllers/setting.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Public routes
router.get('/public', settingController.getPublicSettings);

// Administrative routes
export const adminSettingRouter = Router();
adminSettingRouter.use(authMiddleware, adminMiddleware);
adminSettingRouter.get('/', settingController.getAdminSettings);
adminSettingRouter.put('/', settingController.updateSettings);

export default router;
