const bcrypt = require('bcryptjs');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app'); 
const { sequelize, User, Transaction } = require('../models');

describe('User and Transaction Controller', () => {
  let user, token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create a test user 
    user = await User.create({
      firstName: "Test",
      lastName: "Example",
      email: "realuser@example.com",
      wallet_balance: 0,
      password: hashedPassword
    });

   
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });


  // credits wallet and records transaction
 it('credits wallet and records transaction', async () => {
  const url = '/api/transaction/credit'; 
  const creditAmount = 5000;

  const userBefore = await User.findByPk(user.id);
  const currentBalance = parseFloat(userBefore.wallet_balance) || 0;
  const expectedBalance = currentBalance + creditAmount;

  console.log(`Testing URL: ${url}`);

  const res = await request(app)
    .post(url)
    .set('Authorization', `Bearer ${token}`)
    .send({ email: user.email, amount: creditAmount });

  console.log('Response status:', res.statusCode);
  console.log('Response body:', res.body);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);

  const updatedUser = await User.findByPk(user.id);
expect(parseFloat(updatedUser.wallet_balance)).toBe(expectedBalance);

const tx = await Transaction.findAll({ where: { user_id: user.id } });
expect(tx[tx.length - 1].transaction_type).toBe('credit');

});

// debits wallet when funds are sufficient

it('debits wallet when funds are sufficient', async () => {
  const url = '/api/transaction/debit'; 
  const debitAmount = 500;

  const userBefore = await User.findByPk(user.id);
  const currentBalance = parseFloat(userBefore.wallet_balance) || 0;

  if (currentBalance < debitAmount) {
    throw new Error(`Insufficient funds for this test. Current balance: ${currentBalance}`);
  }

  const expectedBalance = currentBalance - debitAmount;


  const res = await request(app)
    .post(url)
    .set('Authorization', `Bearer ${token}`)
    .send({ email: user.email, amount: debitAmount });

  console.log('Response status:', res.statusCode);
  console.log('Response body:', res.body);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);

const updatedUser = await User.findByPk(user.id);
expect(parseFloat(updatedUser.wallet_balance)).toBe(expectedBalance);

const tx = await Transaction.findAll({ where: { user_id: user.id } });
expect(tx[tx.length - 1].transaction_type).toBe('debit');

});

// fails debit when insufficient funds

  it('fails debit when insufficient funds', async () => {
    const url = '/api/transaction/debit';
    console.log(`Testing URL: ${url}`);

    const res = await request(app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: user.email, amount: 200000000 });

    console.log('Response status:', res.statusCode);
    console.log('Response body:', res.body);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Insufficient funds.');
  });

// fetches paginated transactions for all users

  it('fetches paginated transactions for all users', async () => {
    const url = `/api/transactions?page=1&limit=2`;

    const res = await request(app)
      .get(url)
      .set('Authorization', `Bearer ${token}`);

    console.log('Response status:', res.statusCode);
    console.log('Response body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactions.length).toBeGreaterThan(0);
    expect(res.body.pagination).toHaveProperty('page', 1);
  });
});
