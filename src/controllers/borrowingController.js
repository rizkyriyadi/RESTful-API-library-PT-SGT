const borrowingService = require('../services/borrowingService');

const createBorrowing = async (req, res, next) => {
  try {
    const { book_id, member_id } = req.body;

    if (!book_id || !member_id) {
      const err = new Error('book_id and member_id are required');
      err.status = 400;
      throw err;
    }

    const result = await borrowingService.createBorrowing(book_id, member_id);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const returnBorrowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await borrowingService.returnBorrowing(id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBorrowing,
  returnBorrowing,
};
