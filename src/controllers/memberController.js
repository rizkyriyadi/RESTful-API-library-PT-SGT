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
    const { id } = req.params;
    const result = await memberService.getMemberBorrowings(id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMember,
  getBorrowings,
};
