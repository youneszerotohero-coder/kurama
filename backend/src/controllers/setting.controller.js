import * as settingService from '../services/setting.service.js';

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getPublicSettings();
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getAdminSettings();
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingService.updateSettings(req.body);
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
