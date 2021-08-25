const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const csrf = require("csurf");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const db = require("./utils/database");
const sessionStore = require("express-session-sequelize")(session.Store);

const User = require("./models/user");
const Student = require("./models/student");
const Instructor = require("./models/instructor");
const Course = require("./models/course");

const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");

const app = express();
const store = new sessionStore({
    db: db
});
const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(flash());
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            res.locals.userType = user.user_type;
            next();
        })
        .catch(err => console.log(err));
});

app.use(userRoutes);
app.use(authRoutes);
app.use('/admin', adminRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        path: '/500',
        title: 'Error!'
    });
});

User.hasOne(Student, {
    onDelete: 'CASCADE'
});
Student.belongsTo(User);

User.hasOne(Instructor, {
    onDelete: 'CASCADE'
});
Instructor.belongsTo(User);

Course.belongsToMany(Student, {
    through: 'student-courses'
});
Student.hasMany(Course);

Instructor.hasMany(Course, {
    onDelete: 'CASCADE'
});
Course.belongsTo(Instructor);

db.sync({ force: false })
    .then(result => {
        console.log('Connected!');
        app.listen(3000);
    })
    .catch(err => console.log(err));