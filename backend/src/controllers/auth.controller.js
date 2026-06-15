import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;
    const phoneOrEmail = phone || email;
    const result = await authService.login(phoneOrEmail, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
