const MemberModel = require('../models/member');

// Validasi email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validasi phone format (minimal 10 angka)
function validatePhone(phone) {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

async function registerMember(data) {
  const { name, email, phone, address } = data;

  // Validasi field required
  if (!name || !email || !phone || !address) {
    const err = new Error('All fields are required');
    err.status = 400;
    throw err;
  }

  // Validasi email format
  if (!validateEmail(email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }

  // Validasi email unique
  const existingMember = await MemberModel.findByEmail(email);
  if (existingMember) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }

  // Validasi phone format
  if (!validatePhone(phone)) {
    const err = new Error('Invalid phone format');
    err.status = 400;
    throw err;
  }

  // Create member
  const newMember = await MemberModel.create(name, email, phone, address);

  return {
    id: newMember.id,
    name: newMember.name,
    email: newMember.email,
    phone: newMember.phone,
    address: newMember.address,
    created_at: newMember.created_at,
  };
}

module.exports = {
  registerMember,
};
