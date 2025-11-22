const BookModel = require('../models/book');

async function listBooks(params) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const title = params.title || null;
  const author = params.author || null;

  const data = await BookModel.getBooks({
    title,
    author,
    limit,
    offset,
  });

  const total = await BookModel.countBooks({
    title,
    author,
  });

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
  listBooks,
};