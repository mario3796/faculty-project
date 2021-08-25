module.exports = (req, res, next) => {
    if (req.session.user.user_type !== 'admin') {
        return res.redirect('/');
    }
    next();
};