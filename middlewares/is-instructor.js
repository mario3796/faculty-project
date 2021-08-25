module.exports = (req, res, next) => {
    if (req.session.user.user_type !== 'instructor') {
        return res.redirect('/');
    }
    next();
};