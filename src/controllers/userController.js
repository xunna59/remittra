const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const userController = {

    // create new user
    createUser: async (req, res, next) => {

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
            const { firstName, lastName, email, password, } = req.body;

            // check if user with email exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists. Please use a different email.",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            // create user account 
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });

            // sign and generate login token
            const payload = { id: user.id, email: user.email, };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });

            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,

                },
                token

            });
        } catch (error) {
            next(error);
        }
    },

    // authenticate and login user
    loginUser: async (req, res, next) => {

        // validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false, errors: errors.array().map(err => ({
                    msg: err.msg,
                    key: err.path,
                })),
            });
        }

        try {
            const { email, password } = req.body;

            // validate login credentials
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }

            
            const payload = { id: user.id, email: user.email, };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });

            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });


            res.status(200).json({
                success: true,
                message: "Login successful",
                token
            });
        } catch (error) {
            next(error);
        }
    },

    // fetch user profile
    getUserProfile: async (req, res, next) => {

        try {

            if (!req.user || !req.user.id) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            const userId = req.user.id;

            const user = await User.findOne({
                where: { id: userId },
                attributes: ['firstName', 'lastName', 'email', 'wallet_balance'],
            });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });

        } catch (error) {
            next(error);
        }
    },
}


module.exports = userController;