const createBorrowing = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'borrowing created (dummy)' });
  } catch (err) {
    next(err);
  }
};

const returnBorrowing = async (req, res, next) => {
  try {
    res.json({ message: 'borrowing returned (dummy)' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBorrowing,
  returnBorrowing,
};
