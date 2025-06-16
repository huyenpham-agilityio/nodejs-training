module.exports = (app) => {
  const Tasks = app.db.models.tasks;

  app
    .route("/tasks")
    .all(app.auth.authenticate())
    /**
     * @api {get} /tasks Get tasks
     * @apiGroup Tasks
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiSuccess {Array} tasks List of tasks
     * @apiSuccess {Number} tasks.id Task's id
     * @apiSuccess {String} tasks.title Task's title
     * @apiSuccess {Boolean} tasks.done Task's done
     * @apiSuccess {Number} tasks.userId Task's user id
     * @apiSuccess {Date} tasks.createdAt Task's created at
     * @apiSuccess {Date} tasks.updatedAt Task's updated at
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "tasks": [
     *         {
     *           "id": 1,
     *           "title": "Task1",
     *           "done": false,
     *           "userId": 1,
     *           "createdAt": "2019-01-01T00:00:00.000Z",
     *           "updatedAt": "2019-01-01T00:00:00.000Z"
     *         }
     *       ]
     *     }
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
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
    /**
     * @api {post} /tasks Create task
     * @apiGroup Tasks
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiParam {String} title Task's title
     * @apiParam {Boolean} done Task's done
     * @apiParamExample {json} Request-Example:
     *     {
     *       "title": "Task1",
     *       "done": false
     *     }
     * @apiSuccess {Number} id Task's id
     * @apiSuccess {String} title Task's title
     * @apiSuccess {Boolean} done Task's done
     * @apiSuccess {Number} userId Task's user id
     * @apiSuccess {Date} createdAt Task's created at
     * @apiSuccess {Date} updatedAt Task's updated at
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "id": 1,
     *       "title": "Task1",
     *       "done": false,
     *       "userId": 1,
     *       "createdAt": "2019-01-01T00:00:00.000Z",
     *       "updatedAt": "2019-01-01T00:00:00.000Z"
     *     }
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
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
    /**
     * @api {get} /tasks/:id Get task
     * @apiGroup Tasks
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiSuccess {Number} id Task's id
     * @apiSuccess {String} title Task's title
     * @apiSuccess {Boolean} done Task's done
     * @apiSuccess {Number} userId Task's user id
     * @apiSuccess {Date} createdAt Task's created at
     * @apiSuccess {Date} updatedAt Task's updated at
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "id": 1,
     *       "title": "Task1",
     *       "done": false,
     *       "userId": 1,
     *       "createdAt": "2019-01-01T00:00:00.000Z",
     *       "updatedAt": "2019-01-01T00:00:00.000Z"
     *     }
     * @apiErrorExample {json} Not Found:
     *     HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
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
    /**
     * @api {put} /tasks/:id Update task
     * @apiGroup Tasks
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiParam {String} title Task's title
     * @apiParam {Boolean} done Task's done
     * @apiParamExample {json} Request-Example:
     *     {
     *       "title": "Task1",
     *       "done": false
     *     }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 204 No Content
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
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
    /**
     * @api {delete} /tasks/:id Delete task
     * @apiGroup Tasks
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 204 No Content
     * @apiErrorExample {json} Not Found:
     *     HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
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
