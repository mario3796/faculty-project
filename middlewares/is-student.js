module.exports = (req, res, next) => {
    if (req.session.user.user_type !== 'student') {
        return res.redirect('/');
    }
    next();
};