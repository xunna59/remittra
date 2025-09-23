const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID, 
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2), 
      allowNull: false,
      defaultValue: 0.00,
    },
   
  }, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Transaction;
};
