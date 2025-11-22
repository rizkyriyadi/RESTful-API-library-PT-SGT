const bookService = require('../services/bookService');

async function getBooks(req, res, next) {
  try {
    const result = await bookService.listBooks(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBooks,
};
