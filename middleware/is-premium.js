exports.isPremium = (req, res, next) => {
  if (req.user.isPremium === false) {
    return res.redirect("/");
  }
  next();
};
