const { pool } = require('../config/database');
const BookModel = require('../models/book');
const MemberModel = require('../models/member');
const BorrowingModel = require('../models/borrowing');

// Get current borrowing count for a member (only BORROWED status)
async function getCurrentBorrowingCount(memberId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM borrowings WHERE member_id = $1 AND status = $2',
    [memberId, 'BORROWED']
  );
  return Number(result.rows[0].count);
}

async function createBorrowing(bookId, memberId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check book exists and has stock
    const book = await BookModel.findById(bookId);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }

    if (book.stock <= 0) {
      const err = new Error('Book out of stock');
      err.status = 400;
      throw err;
    }

    // Check member exists
    const member = await MemberModel.findById(memberId);
    if (!member) {
      const err = new Error('Member not found');
      err.status = 404;
      throw err;
    }

    // Check member borrowing count (max 3)
    const borrowingCount = await getCurrentBorrowingCount(memberId);
    if (borrowingCount >= 3) {
      const err = new Error('Member already borrowed 3 books');
      err.status = 400;
      throw err;
    }

    // Decrease book stock
    await client.query(
      'UPDATE books SET stock = stock - 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [bookId]
    );

    // Create borrowing record
    const borrowResult = await client.query(
      'INSERT INTO borrowings (book_id, member_id, borrow_date, status) VALUES ($1, $2, CURRENT_DATE, $3) RETURNING *',
      [bookId, memberId, 'BORROWED']
    );

    await client.query('COMMIT');

    return borrowResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function returnBorrowing(borrowingId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check borrowing exists
    const borrowing = await BorrowingModel.findById(borrowingId);
    if (!borrowing) {
      const err = new Error('Borrowing record not found');
      err.status = 404;
      throw err;
    }

    // Check if already returned
    if (borrowing.status === 'RETURNED') {
      const err = new Error('Book already returned');
      err.status = 400;
      throw err;
    }

    // Update borrowing status and return date
    const updateResult = await client.query(
      'UPDATE borrowings SET status = $1, return_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['RETURNED', borrowingId]
    );

    // Increase book stock
    await client.query(
      'UPDATE books SET stock = stock + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [borrowing.book_id]
    );

    await client.query('COMMIT');

    return updateResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createBorrowing,
  returnBorrowing,
};
