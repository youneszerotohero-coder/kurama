import * as clientService from '../services/client.service.js';

export const getAllClients = async (req, res, next) => {
  try {
    const clients = await clientService.getAllClients();
    return res.status(200).json(clients);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);
    return res.status(201).json(client);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    return res.status(200).json(client);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const result = await clientService.deleteClient(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const toggleClientApproval = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const client = await clientService.toggleClientApproval(req.params.id, approved);
    return res.status(200).json(client);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
