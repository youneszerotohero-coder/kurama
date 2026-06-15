import { Router } from 'express';
import * as clientController from '../controllers/client.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

// Mounting check inside the route definition
router.use(authMiddleware, adminMiddleware);

router.get('/', clientController.getAllClients);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.put('/:id/approve', clientController.toggleClientApproval);

export default router;
