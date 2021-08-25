const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    console.log(message);
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        title: 'Login',
        isAuthenticated: false,
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            password: ''
        }
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        title: 'Sign up',
        isAuthenticated: false,
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: '',
            name: '',
            password: '',
            confirmPassword: ''
        }
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/login",
            title: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: validationResult(req).array()
        });
    }
    User.findOne({
            where: { email: email }
        })
        .then(user => {
            if (!user) {
                return res.status(422).render("auth/login", {
                    path: "/login",
                    title: "Login",
                    errorMessage: 'Invalid email or password!',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: validationResult(req).array()
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    } else {
                        return res.status(422).render("auth/login", {
                            path: "/login",
                            title: "Login",
                            errorMessage: 'Invalid email or password!',
                            oldInput: {
                                email: email,
                                password: password
                            },
                            validationErrors: validationResult(req).array()
                        });
                    }
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render("auth/signup", {
            path: "/signup",
            title: "Signup",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                name: name,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: validationResult(req).array()
        });
    }
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            User.create({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    user_type: 'admin'
                })
                .then(result => {
                    console.log('User Created!');
                    return res.redirect('/login');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};