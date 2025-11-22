const memberService = require('../services/memberService');

const createMember = async (req, res, next) => {
  try {
    const result = await memberService.registerMember(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
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
