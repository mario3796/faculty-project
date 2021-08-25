const Course = require("../models/course");
const Instructor = require("../models/instructor");
const Student = require("../models/student");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getAddUser = (req, res, next) => {
    res.render("admin/edit-user", {
        path: "/admin/add-user",
        title: "Add User",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddUser = (req, res, next) => {
    const name = req.body.firstName + " " + req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const department = req.body.department;
    const userType = req.body.userType;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-user', {
            path: '/admin/add-user',
            title: 'Add User',
            editing: false,
            errorMessage: errors.array()[0].msg,
            user: {
                name: name,
                email: email,
                password: password,
                department: department,
                user_type: userType
            },
            hasError: true,
            validationErrors: errors.array()
        });
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            if (userType === "student") {
                const user = new User({
                    name: name.trim(),
                    email: email,
                    password: hashedPassword,
                    user_type: userType,
                });
                return user
                    .save()
                    .then((result) => {
                        user.createStudent({
                            department: department,
                        });
                        console.log("Student Created!");
                        res.redirect("/");
                    })
                    .catch((err) => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
            } else {
                const user = new User({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    user_type: userType,
                });
                return user
                    .save()
                    .then((result) => {
                        user.createInstructor({
                            department: department,
                        });
                        console.log("Instructor Created!");
                        res.redirect("/");
                    })
                    .catch((err) => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
            }
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getStudents = (req, res, next) => {
    User.findAll({
            where: { user_type: "student" },
            include: Student,
        })
        .then((users) => {
            res.render("admin/users", {
                path: "/admin/students",
                title: "Students",
                users: users,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getInstructors = (req, res, next) => {
    User.findAll({
            where: { user_type: "instructor" },
            include: Instructor,
        })
        .then((users) => {
            res.render("admin/users", {
                path: "/admin/instructors",
                title: "Instructors",
                users: users,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findByPk(userId, {
            include: [Student, Instructor],
        })
        .then((user) => {
            const firstName = user.name.split(" ")[0].trim();
            const lastName = user.name.split(" ")[1].trim();
            let department;
            if (user.user_type === "student") {
                department = user.Student.department;
            } else {
                department = user.Instructor.department;
            }
            res.render("admin/edit-user", {
                path: "/admin/edit-user",
                title: "Edit User",
                editing: true,
                firstName: firstName,
                lastName: lastName,
                user: user,
                department: department,
                hasError: false,
                validationErrors: [],
                errorMessage: null
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditUser = (req, res, next) => {
    const userId = req.body.userId;
    const name = req.body.firstName.trim() + " " + req.body.lastName.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const department = req.body.department.trim();
    const userType = req.body.userType.trim();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-user', {
            path: '/admin/add-user',
            title: 'Add User',
            editing: true,
            errorMessage: errors.array()[0].msg,
            user: {
                name: name,
                email: email,
                password: password,
                department: department,
                user_type: userType
            },
            hasError: true,
            validationErrors: errors.array()
        });
    }

    User.findByPk(userId, {
            include: [Student, Instructor],
        })
        .then((user) => {
            bcrypt
                .hash(password, 12)
                .then((hashedPassword) => {
                    if (user.user_type === userType) {
                        user.name = name;
                        user.email = email;
                        user.password = hashedPassword;
                        if (user.user_type === "student") {
                            user.Student.department = department;
                            user.Student.save();
                        } else {
                            user.Instructor.department = department;
                            user.Instructor.save();
                        }
                        user
                            .save()
                            .then((result) => {
                                console.log("User Updated!");
                                return res.redirect("/");
                            })
                            .catch((err) => {
                                const error = new Error(err);
                                error.httpStatusCode = 500;
                                return next(error);
                            });
                    } else {
                        user.name = name;
                        user.email = email;
                        user.password = hashedPassword;
                        if (user.user_type === "student") {
                            Student.destroy({ where: { UserId: userId } })
                                .then((result) => {
                                    user.createInstructor({
                                        department: department,
                                    });
                                    user.user_type = userType;
                                    user.save().then((result) => {
                                        console.log("User Updated!");
                                        return res.redirect("/");
                                    });
                                })
                                .catch((err) => {
                                    const error = new Error(err);
                                    error.httpStatusCode = 500;
                                    return next(error);
                                });
                        } else {
                            Instructor.destroy({ where: { UserId: userId } })
                                .then((result) => {
                                    user.createStudent({
                                        department: department,
                                    });
                                    user.user_type = userType;
                                    user.save().then((result) => {
                                        console.log("User Updated!");
                                        return res.redirect("/");
                                    });
                                })
                                .catch((err) => {
                                    const error = new Error(err);
                                    error.httpStatusCode = 500;
                                    return next(error);
                                });
                        }
                    }
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteUser = (req, res, next) => {
    const userId = req.body.userId;
    User.findByPk(userId)
        .then((user) => {
            user.destroy().then((result) => {
                console.log("User Deleted!");
                return res.redirect("/");
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAddCourse = (req, res, next) => {
    User.findAll({
            where: { user_type: "instructor" },
            include: Instructor,
        })
        .then((users) => {
            res.render("admin/add-course", {
                title: "Add Course",
                path: "/admin/add-course",
                users: users,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddCourse = (req, res, next) => {
    const name = req.body.name;
    const instructorId = +req.body.instructorId;
    Instructor.findByPk(instructorId)
        .then((instructor) => {
            instructor
                .createCourse({
                    name: name,
                })
                .then((result) => {
                    console.log("Course Created!");
                    return res.redirect("/courses");
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteCourse = (req, res, next) => {
    const courseId = req.body.courseId;
    Course.findByPk(courseId)
        .then((course) => {
            course
                .destroy()
                .then((result) => {
                    console.log("Course Deleted!");
                    return res.redirect("/courses");
                })
                .catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};