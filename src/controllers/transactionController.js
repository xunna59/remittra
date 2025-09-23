const { Transaction, User } = require('../models');

const transactionController = {

  // Credit wallet
  creditUserWallet: async (req, res, next) => {
    try {
      const { email, amount } = req.body;

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount.",
        });
      }

      // check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const currentBalance = existingUser.wallet_balance || 0;
      const newBalance = parseFloat(currentBalance) + parseFloat(amount);

      // update balance
      existingUser.wallet_balance = newBalance;
      await existingUser.save();

      // record transaction
      await Transaction.create({
        user_id: existingUser.id,
        type: "credit",
        amount,
      });

      return res.status(200).json({
        success: true,
        balance: newBalance,
      });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Debit wallet
  debitUserWallet: async (req, res, next) => {
    try {
      const { email, amount } = req.body;

      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount.",
        });
      }

      // check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

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
        type: "debit",
        amount,
      });

      return res.status(200).json({
        success: true,
        balance: newBalance,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = transactionController;
