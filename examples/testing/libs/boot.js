module.exports = async (app) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  await app.db.sequelize.sync();

  app.listen(app.get("port"), () => {
    console.log(`NTask API is running on http://localhost:${app.get("port")}`);
  });
};
