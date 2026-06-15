import * as shippingService from '../services/shipping.service.js';

export const getTerritories = async (req, res, next) => {
  try {
    const data = await shippingService.getTerritories();
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getRatesAdmin = async (req, res, next) => {
  try {
    const data = await shippingService.getRatesAdmin();
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const bulkUpdateRates = async (req, res, next) => {
  try {
    const { rates } = req.body;
    if (!rates || !Array.isArray(rates)) {
      return res.status(400).json({ message: 'Invalid or missing rates list.' });
    }
    const data = await shippingService.bulkUpdateRates(rates);
    return res.status(200).json({
      message: 'Shipping rates updated successfully',
      data
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
