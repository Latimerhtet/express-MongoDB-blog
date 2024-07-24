exports.get404Page = (req, res) => {
  return res.status(404).render("errors/404", { title: "Page Not found" });
};
exports.get500Page = (err, req, res, next) => {
  return res.status(500).render("errors/500", {
    title: "Something Went wrong",
    errorMsg: err.message,
  });
};
