const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const isNotAuth = require("../middlewares/is-not-auth");

router.get('/signup', isNotAuth, authController.getSignup);

router.post('/signup', isNotAuth, [
    check('email').isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, { req }) => {
        // custom validator return true or false
        // or return a thrown error or a promise
        if (value !== "tester@test.com") {
            throw new Error("You 're not allowed to sign in!");
        }
        return User.findOne({ where: { email: value } })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already exists!');
                }
            })

    }).normalizeEmail(),

    check('name').trim().notEmpty()
    .withMessage('Please enter a valid user name!')
    .custom((value, { req }) => {
        // custom validator return true or false
        // or return a thrown error or a promise
        return User.findOne({ where: { name: value } })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('User name already exists!');
                }
            })

    }),

    body('password', 'Please enter a valid password with minimum length 6 characters!')
    .trim().isAlphanumeric().isLength({ min: 6 }),

    body('confirmPassword')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match!');
        }
        return true;
    }),
], authController.postSignup);

router.get('/login', isNotAuth, authController.getLogin);

router.post('/login', isNotAuth, [
    check('email').isEmail().normalizeEmail()
    .withMessage('Please enter a valid email!'),

    body('password', 'Please enter a valid password with minimum length 6 characters!')
    .trim().notEmpty().isAlphanumeric().isLength({ min: 6 })
], authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;