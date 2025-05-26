module.exports = (app) => {
  app.listen(app.get("port"), () => {
    console.log(`NTask API is running on http://localhost:${app.get("port")}`);
  });
};
