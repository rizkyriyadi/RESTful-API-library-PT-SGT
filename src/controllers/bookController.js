const getBooks = async (req, res, next) => {
  try {
    res.json({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBooks,
};
