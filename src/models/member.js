const { query } = require('../config/database');

async function findByEmail(email) {
  const { rows } = await query(
    'SELECT * FROM members WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM members WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create(name, email, phone, address) {
  const { rows } = await query(
    'INSERT INTO members (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, phone, address]
  );
  return rows[0];
}

module.exports = {
  findByEmail,
  findById,
  create,
};
