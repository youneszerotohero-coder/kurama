import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

const clientSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  company: true,
  wilaya: true,
  commune: true,
  approved: true,
  createdAt: true,
};

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizePhone = (phone) => phone.trim().replace(/\s+/g, '');

const getClientById = async (id) => {
  const clientId = parseInt(id);
  if (Number.isNaN(clientId)) {
    throw new Error('Invalid client id.');
  }

  const client = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!client || client.role !== 'CLIENT') {
    throw new Error('Client not found.');
  }

  return client;
};

export const getAllClients = async () => {
  return await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: clientSelect,
    orderBy: { id: 'desc' },
  });
};

export const createClient = async (clientData) => {
  const { fullName, email, phone, company, wilaya, commune, approved, password } = clientData;

  if (!fullName || !phone || !wilaya || !commune) {
    throw new Error('Full name, phone, wilaya, and commune are required.');
  }

  const cleanPhone = normalizePhone(phone);
  const cleanEmail = normalizeEmail(email || `${cleanPhone}@electrohub.dz`);

  const existingUserByPhone = await prisma.user.findUnique({
    where: { phone: cleanPhone },
  });
  if (existingUserByPhone) {
    throw new Error('Phone number is already registered.');
  }

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existingUserByEmail) {
    throw new Error('Email is already registered.');
  }

  const generatedPassword = password?.trim() || randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(generatedPassword, 10);

  const newClient = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      company: company?.trim() || null,
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      approved: Boolean(approved),
      role: 'CLIENT',
      passwordHash,
    },
    select: clientSelect,
  });

  return {
    ...newClient,
    temporaryPassword: password ? null : generatedPassword,
  };
};

export const updateClient = async (id, clientData) => {
  const current = await getClientById(id);
  const { fullName, email, phone, company, wilaya, commune, approved } = clientData;

  const data = {};

  if (fullName !== undefined) data.fullName = fullName.trim();
  if (email !== undefined) {
    const cleanEmail = normalizeEmail(email);
    if (cleanEmail !== current.email) {
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing && existing.id !== current.id) {
        throw new Error('Email is already in use.');
      }
    }
    data.email = cleanEmail;
  }
  if (phone !== undefined) {
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone !== current.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existing && existing.id !== current.id) {
        throw new Error('Phone number is already in use.');
      }
    }
    data.phone = cleanPhone;
  }
  if (company !== undefined) data.company = company.trim() || null;
  if (wilaya !== undefined) data.wilaya = wilaya.trim();
  if (commune !== undefined) data.commune = commune.trim();
  if (approved !== undefined) data.approved = Boolean(approved);

  return await prisma.user.update({
    where: { id: current.id },
    data,
    select: clientSelect,
  });
};

export const deleteClient = async (id) => {
  const client = await getClientById(id);

  await prisma.user.delete({
    where: { id: client.id },
  });

  return { message: 'Client deleted successfully.' };
};

export const toggleClientApproval = async (id, approved) => {
  const current = await getClientById(id);

  // If approved is not explicitly passed, toggle it
  const nextApproved = approved !== undefined ? approved : !current.approved;

  return await prisma.user.update({
    where: { id: current.id },
    data: { approved: nextApproved },
    select: clientSelect,
  });
};
