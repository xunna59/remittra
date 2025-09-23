const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const rateLimit = require('express-rate-limit');


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
});

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Application is running smoothly!',
    });
});

router.post('/auth/register',

    [
        body('firstname').notEmpty().withMessage('First Name is required.'),
        body('lastname').notEmpty().withMessage('Last Name is required.'),
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    userController.createUser
);

router.post('/auth/login',
    [
        body('email').isEmail().withMessage('Email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    loginLimiter,
    userController.loginUser
);






module.exports = router;