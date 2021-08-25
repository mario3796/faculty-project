const User = require("../models/user");
const { Op } = require("sequelize");
const Instructor = require("../models/instructor");
const Course = require("../models/course");
const Student = require("../models/student");

exports.getIndex = (req, res, next) => {
    User.findAll({
            where: {
                user_type: {
                    [Op.not]: 'admin'
                }
            }
        })
        .then(users => {
            res.render('index', {
                path: '/',
                title: 'Index',
                users: users
            });
        })
        .catch(err => console.log(err));
};

exports.getCourses = (req, res, next) => {
    Course.findAll({
            include: Instructor
        })
        .then(courses => {
            User.findAll()
                .then(users => {
                    res.render("courses", {
                        path: "/courses",
                        title: "Courses",
                        courses: courses,
                        users: users
                    });

                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInstructorCourses = (req, res, next) => {
    req.user.getInstructor()
        .then(instructor => {
            instructor.getCourses()
                .then(courses => {
                    res.render('courses', {
                        path: '/instructor/courses',
                        courses: courses,
                        title: 'My Courses'
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAddCourse = (req, res, next) => {
    Course.findAll({
            include: [Instructor, Student],
        })
        .then(courses => {
            let remainingCourses = [];
            courses.forEach(course => {
                console.log(course.Students);
                if (course.Students.length > 0) {
                    let isRegistered = false;
                    course.Students.forEach(student => {
                        if (student.UserId === req.user.id) {
                            isRegistered = true;
                        }
                    });
                    if (!isRegistered) {
                        remainingCourses.push(course);
                    }
                } else {
                    remainingCourses.push(course);
                }
            });
            courses = [...remainingCourses];
            User.findAll()
                .then(users => {
                    res.render("student/add-course", {
                        path: "/student/add-course",
                        title: "Register Courses",
                        courses: courses,
                        users: users
                    });

                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddCourse = (req, res, next) => {
    const courseId = req.body.courseId;
    Course.findByPk(courseId)
        .then(course => {
            Student.findOne({ where: { UserId: req.user.id } })
                .then(student => {
                    student.addCourse(course);
                    course.addStudent(student)
                        .then(result => {
                            console.log('Course Registered!');
                            return res.redirect('/student/add-course');
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        });
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getStudentCourses = (req, res, next) => {
    Student.findOne({
            where: { UserId: req.user.id },
            include: Course
        })
        .then(student => {
            console.log(student.Courses);
            User.findAll({
                    include: Instructor
                })
                .then(users => {
                    let instructors = [];
                    users.forEach(user => {
                        if (user.Instructor) {
                            instructors.push(user);
                        }
                    });
                    users = [...instructors];
                    res.render('courses', {
                        path: '/student/courses',
                        title: 'My Courses',
                        courses: student.Courses,
                        users: users
                    })
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteCourse = (req, res, next) => {
    const courseId = req.body.courseId;
    Course.findByPk(courseId)
        .then(course => {
            Student.findOne({
                    where: { UserId: req.user.id }
                })
                .then(student => {
                    course.removeStudent(student);
                    student.removeCourse(course)
                        .then(result => {
                            console.log('Course Deleted!');
                            return res.redirect('/student/courses');
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCourseStudents = (req, res, next) => {
    const courseId = req.params.courseId;
    Course.findByPk(courseId)
        .then(course => {
            course.getStudents()
                .then(students => {
                    User.findAll()
                        .then(users => {
                            return res.render('course-students', {
                                path: '/course-students',
                                title: 'Course Students',
                                students: students,
                                users: users
                            })
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};