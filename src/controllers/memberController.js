const createMember = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'member created (dummy)' });
  } catch (err) {
    next(err);
  }
};

const getBorrowings = async (req, res, next) => {
  try {
    res.json({ data: [], pagination: {} });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMember,
  getBorrowings,
};
