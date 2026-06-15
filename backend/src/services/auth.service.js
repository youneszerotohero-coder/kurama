import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';

export const register = async (userData) => {
  const { fullName, phone, password, email, company, wilaya, commune } = userData;

  if (!fullName || !phone || !password) {
    throw new Error('FullName, Phone, and Password are required fields.');
  }

  // Normalize phone
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  
  // Check if phone already exists
  const existingUserByPhone = await prisma.user.findUnique({
    where: { phone: cleanPhone },
  });
  if (existingUserByPhone) {
    throw new Error('Phone number is already registered.');
  }

  // Generate email if not provided
  const userEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@electrohub.dz`;

  // Check if email already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (existingUserByEmail) {
    throw new Error('Email is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: userEmail,
      company: company ? company.trim() : 'ElectroTech Solutions DZ',
      wilaya: wilaya ? wilaya.trim() : 'Algiers (16)',
      commune: commune ? commune.trim() : 'Hydra',
      passwordHash,
      approved: false, // Must be approved by admin
      role: 'CLIENT',
    },
  });

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword, token };
};

export const login = async (phoneOrEmail, password) => {
  if (!phoneOrEmail || !password) {
    throw new Error('Phone or Email, and Password are required.');
  }

  const cleanInput = phoneOrEmail.trim();

  // Find user by phone or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: cleanInput.replace(/\s+/g, '') },
        { email: cleanInput.toLowerCase() },
      ],
    },
  });

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new Error('Invalid credentials.');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error('User not found.');
  }
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateProfile = async (userId, updateData) => {
  const { fullName, email, phone, company, wilaya, commune } = updateData;

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) throw new Error('User not found.');

  // Validate phone unique if changing
  if (phone) {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone !== current.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existing) throw new Error('Phone number is already in use.');
      updateData.phone = cleanPhone;
    }
  }

  // Validate email unique if changing
  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== current.email) {
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) throw new Error('Email is already in use.');
      updateData.email = cleanEmail;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: fullName ? fullName.trim() : undefined,
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim().replace(/\s+/g, '') : undefined,
      company: company !== undefined ? company : undefined,
      wilaya: wilaya ? wilaya.trim() : undefined,
      commune: commune ? commune.trim() : undefined,
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};
