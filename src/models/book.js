const { query } = require('../config/database');

async function getBooks({ title, author, limit, offset }) {
  let sql = `
    SELECT 
      id, title, author, published_year, stock, isbn,
      (stock > 0) AS available
    FROM books
    WHERE 1=1
  `;
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    sql += ` AND LOWER(title) LIKE LOWER($${params.length})`;
  }

  if (author) {
    params.push(`%${author}%`);
    sql += ` AND LOWER(author) LIKE LOWER($${params.length})`;
  }

  // pagination
  params.push(limit);
  sql += ` LIMIT $${params.length}`;

  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const { rows } = await query(sql, params);
  return rows;
}

// HITUNG total data (tanpa pagination)
async function countBooks({ title, author }) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM books
    WHERE 1=1
  `;
  const params = [];

  if (title) {
    params.push(`%${title}%`);
    sql += ` AND LOWER(title) LIKE LOWER($${params.length})`;
  }

  if (author) {
    params.push(`%${author}%`);
    sql += ` AND LOWER(author) LIKE LOWER($${params.length})`;
  }

  const { rows } = await query(sql, params);
  return Number(rows[0].total);
}

async function findById(id) {
  const { rows } = await query(
    `SELECT * FROM books WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  getBooks,
  countBooks,
  findById,
};
