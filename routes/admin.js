const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");
const isAdmin = require("../middlewares/is-admin");
const { body, check } = require("express-validator");

router.get('/add-user', isAuth, isAdmin, adminController.getAddUser);

router.post('/add-user', isAuth, isAdmin, [
    body('firstName').isString().trim().isLength({ min: 2 }).withMessage('Please fill the first name field!'),
    body('lastName').isString().trim().isLength({ min: 2 }).withMessage('Please fill the last name field!'),
    body('email').isEmail().normalizeEmail().trim().withMessage('Please enter a valid Email!'),
    body('password', 'Please enter a valid password with minimum length 6 characters!')
    .trim().isAlphanumeric().isLength({ min: 6 }),
    body('department').isString().isLength({ min: 2 }).trim().withMessage('Please fill the department field!'),
    body('userType').isString()
    .custom((value, { req }) => {
        if (value === '') {
            return Promise.reject('Please fill the department field!');
        }
    })
], adminController.postAddUser);

router.get('/edit-user/:userId', isAuth, isAdmin, adminController.getEditUser);

router.post('/edit-user/:userId', isAuth, isAdmin, [
    body('firstName').isString().trim().isLength({ min: 2 }).withMessage('Please fill the first name field!'),
    body('lastName').isString().trim().isLength({ min: 2 }).withMessage('Please fill the last name field!'),
    body('email').isEmail().normalizeEmail().trim().withMessage('Please enter a valid Email!'),
    body('password', 'Please enter a valid password with minimum length 6 characters!')
    .trim().isAlphanumeric().isLength({ min: 6 }),
    body('department').isString().isLength({ min: 2 }).trim().withMessage('Please fill the department field!'),
    body('userType')
    .custom((value, { req }) => {
        if (value === '') {
            return Promise.reject('Please choose the type of user!');
        }
    })
], adminController.postEditUser);

router.post('/delete-user', isAuth, isAdmin, adminController.postDeleteUser);

router.get('/add-course', isAuth, isAdmin, [
    body('name').isString().isLength({ min: 2 }).trim().withMessage('Please fill the course field!'),
    body('instructorId')
    .custom((value, { req }) => {
        if (value === '') {
            return Promise.reject('Please choose the instructor!');
        }
    })
], adminController.getAddCourse);

router.post('/add-course', isAuth, isAdmin, adminController.postAddCourse);

router.get('/students', adminController.getStudents);

router.get('/instructors', adminController.getInstructors);

router.get('/add-courses', isAuth, isAdmin, adminController.getAddCourse);

router.post('/delete-course', isAuth, isAdmin, adminController.postDeleteCourse);

module.exports = router;