import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import { errorHandlerMiddleware } from './middleware/error.middleware.js';

// Import routers
import authRouter from './routes/auth.routes.js';
import productRouter, { adminProductRouter } from './routes/product.routes.js';
import orderRouter, { adminOrderRouter } from './routes/order.routes.js';
import clientRouter from './routes/client.routes.js';
import settingRouter, { adminSettingRouter } from './routes/setting.routes.js';
import shippingRouter, { adminShippingRouter } from './routes/shipping.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount Public/Client API Routers
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/settings', settingRouter);
app.use('/api/shipping', shippingRouter);

// Mount Admin API Routers
app.use('/api/admin/products', adminProductRouter);
app.use('/api/admin/orders', adminOrderRouter);
app.use('/api/admin/clients', clientRouter);
app.use('/api/admin/settings', adminSettingRouter);
app.use('/api/admin/shipping', adminShippingRouter);

// Global Error Handler Middleware
app.use(errorHandlerMiddleware);

// Catch 404 Route
app.use('*', (req, res) => {
  res.status(404).json({ message: `Endpoint ${req.originalUrl} not found.` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` ElectroHub Backend Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV}`);
  console.log(`=========================================`);
});
