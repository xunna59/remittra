const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const rateLimit = require('express-rate-limit');

// app status check route
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Application is running smoothly!',
    });
});

// rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});

// user registration route
router.post('/auth/register',

    [
        body('firstname').notEmpty().withMessage('First Name is required.'),
        body('lastname').notEmpty().withMessage('Last Name is required.'),
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    userController.createUser
);

// user login route
router.post('/auth/login',
    [
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    loginLimiter,
    userController.loginUser
);


// credit user route

router.post('transaction/credit', 

    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
    ],

    transactionController.creditUserWallet

);

// debit user route
router.post('transaction/debit', 

    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
    ],

    transactionController.debitUserWallet

);


ß


module.exports = router;