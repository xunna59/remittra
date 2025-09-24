const { Transaction, User } = require('../models');
const { validationResult } = require('express-validator');


const transactionController = {

  // get authenticated user transaction history
  getUserTransactions: async (req, res, next) => {
    try {
      const userId = req.user.id; 

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // get pagination params from query
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return res.status(200).json({
        success: true,
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
        
      });
    } catch (err) {
      next(err);
    }
  },

  // Credit user wallet
  creditUserWallet: async (req, res, next) => {

      // validate request
     const errors = validationResult(req);
       if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    msg: err.msg,
                    key: err.path,
                })),
            });
        }
    
    try {

      const { email, amount } = req.body;

      // check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // validate user balance
      const currentBalance = existingUser.wallet_balance || 0;
      const newBalance = parseFloat(currentBalance) + parseFloat(amount);

      // update balance
      existingUser.wallet_balance = newBalance;
      await existingUser.save();

      // record transaction
      await Transaction.create({
        user_id: existingUser.id,
        transaction_type: "credit",
        amount,
      });

      return res.status(200).json({
        success: true,
        message: `#${amount} was credited to your account`,
      });
    } catch (err) {
      next(err);
    }
  },

  // Debit user wallet
  debitUserWallet: async (req, res, next) => {
     
    // validate request
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    msg: err.msg,
                    key: err.path,
                })),
            });
        }

    try {


      const { email, amount } = req.body;

      // check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // validate user balance
      const currentBalance = existingUser.wallet_balance || 0;
      if (currentBalance < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient funds.",
        });
      }

      const newBalance = parseFloat(currentBalance) - parseFloat(amount);

      // update balance
      existingUser.wallet_balance = newBalance;
      await existingUser.save();

      // record transaction
      await Transaction.create({
        user_id: existingUser.id,
        transaction_type: "debit",
        amount,
      });

      return res.status(200).json({
        success: true,
        message: `#${amount} was debited from your account`,

      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = transactionController;
