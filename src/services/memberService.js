const MemberModel = require('../models/member');
const BorrowingModel = require('../models/borrowing');

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

async function getMemberBorrowings(memberId, params) {
  // Validasi member exists
  const member = await MemberModel.findById(memberId);
  if (!member) {
    const err = new Error('Member not found');
    err.status = 404;
    throw err;
  }

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;
  const status = params.status || null;

  const borrowings = await BorrowingModel.getByMemberId(memberId, {
    status,
    limit,
    offset,
  });

  const total = await BorrowingModel.countByMemberId(memberId, status);

  const data = borrowings.map(item => ({
    id: item.id,
    borrow_date: item.borrow_date,
    return_date: item.return_date,
    status: item.status,
    created_at: item.created_at,
    book: {
      id: item.book_id,
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      published_year: item.published_year,
    },
  }));

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  registerMember,
  getMemberBorrowings,
};
