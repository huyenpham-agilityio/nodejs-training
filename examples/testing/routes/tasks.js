module.exports = (app) => {
  const Tasks = app.db.models.tasks;

  app
    .route("/tasks")
    .all(app.auth.authenticate())
    .get((req, res) => {
      Tasks.findAll({
        where: {
          userId: req.user.id,
        },
      })
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    })
    .post((req, res) => {
      req.body.userId = req.user.id;
      Tasks.create(req.body)
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    });

  app
    .route("/tasks/:id")
    .all(app.auth.authenticate())
    .get((req, res) => {
      Tasks.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
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
      Tasks.update(req.body, {
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      })
        .then(() => res.sendStatus(204))
        .catch((error) => {
          res.status(412).json({ msg: error.message });
        });
    })
    .delete((req, res) => {
      Tasks.destroy({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      })
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
