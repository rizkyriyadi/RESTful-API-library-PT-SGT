const { query } = require('../config/database');

async function getByMemberId(memberId, filters) {
  const { status, limit, offset } = filters;

  let sql = `
    SELECT 
      b.id,
      b.borrow_date,
      b.return_date,
      b.status,
      b.created_at,
      bk.id as book_id,
      bk.title,
      bk.author,
      bk.isbn,
      bk.published_year
    FROM borrowings b
    JOIN books bk ON b.book_id = bk.id
    WHERE b.member_id = $1
  `;

  const params = [memberId];

  if (status) {
    params.push(status);
    sql += ` AND b.status = $${params.length}`;
  }

  sql += ` ORDER BY b.created_at DESC`;

  params.push(limit);
  sql += ` LIMIT $${params.length}`;

  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const { rows } = await query(sql, params);
  return rows;
}

async function countByMemberId(memberId, status) {
  let sql = `
    SELECT COUNT(*) AS total
    FROM borrowings
    WHERE member_id = $1
  `;
  const params = [memberId];

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }

  const { rows } = await query(sql, params);
  return Number(rows[0].total);
}

async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM borrowings WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findByIdWithBook(id) {
  const { rows } = await query(`
    SELECT 
      b.*,
      bk.title,
      bk.author,
      bk.isbn
    FROM borrowings b
    JOIN books bk ON b.book_id = bk.id
    WHERE b.id = $1
  `, [id]);
  return rows[0] || null;
}

async function create(bookId, memberId, borrowDate) {
  const { rows } = await query(
    'INSERT INTO borrowings (book_id, member_id, borrow_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [bookId, memberId, borrowDate, 'BORROWED']
  );
  return rows[0];
}

async function updateReturn(id, returnDate) {
  const { rows } = await query(
    'UPDATE borrowings SET status = $1, return_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    ['RETURNED', returnDate, id]
  );
  return rows[0];
}

module.exports = {
  getByMemberId,
  countByMemberId,
  findById,
  findByIdWithBook,
  create,
  updateReturn,
};
