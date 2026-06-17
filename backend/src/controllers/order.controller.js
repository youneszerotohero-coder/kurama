import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    // If authenticated user, inject user ID
    const userId = req.user ? req.user.id : null;
    const order = await orderService.createOrder(req.body, userId);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Admin controller handlers
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrdersAdmin();
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await orderService.getDashboardStats(startDate, endDate);
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
