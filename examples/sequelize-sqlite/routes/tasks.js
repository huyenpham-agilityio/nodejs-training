module.exports = (app) => {
  const Tasks = app.db.models.Tasks;

  app
    .route("/tasks")
    .get((req, res) => {
      Tasks.findAll({})
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    })
    .post((req, res) => {
      Tasks.create(req.body)
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    });

  app
    .route("/tasks/:id")
    .get((req, res) => {
      Tasks.findOne({
        where: {
          id: req.params.id,
        },
      })
        .then((result) => {
          if (result) {
            res.json(result);
          } else {
            res.sendStatus(404);
          }
        })
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    })
    .put((req, res) => {
      Tasks.update(req.body, { where: req.params })
        .then((result) => {
          if (result[0] === 1) {
            res.json({ msg: "Task updated successfully" });
          } else {
            res.sendStatus(404);
          }
        })
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    })
    .delete((req, res) => {
      Tasks.destroy({ where: req.params })
        .then((result) => {
          if (result === 1) {
            res.sendStatus(204);
          } else {
            res.sendStatus(404);
          }
        })
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    });
};
