const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isInstructor = require("../middlewares/is-instructor");
const isStudent = require("../middlewares/is-student");

router.get('/', userController.getIndex);

router.get('/courses', userController.getCourses);

router.get('/instructor/courses', isInstructor, userController.getInstructorCourses);

router.get('/student/add-course', isStudent, userController.getAddCourse);

router.post('/student/add-course', isStudent, userController.postAddCourse);

router.get('/student/courses', isStudent, userController.getStudentCourses);

router.post('/student/delete-course', isStudent, userController.postDeleteCourse);

router.get('/course-students/:courseId', userController.getCourseStudents);

module.exports = router;