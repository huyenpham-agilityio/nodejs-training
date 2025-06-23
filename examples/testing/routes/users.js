module.exports = (app) => {
  const Users = app.db.models.users;

  app
    .route("/user")
    .all(app.auth.authenticate())
    /**
     * @api {get} /user Get user
     * @apiGroup User
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiSuccess {Number} id User's id
     * @apiSuccess {String} name User's name
     * @apiSuccess {String} email User's email
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "id": 1,
     *       "name": "Huyen",
     *       "email": "huyen@gmail.com"
     *     }
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
    .get((req, res) => {
      Users.findByPk(req.user.id, {
        attributes: ["id", "name", "email"],
      })
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({ message: error.message });
        });
    })
    /**
     * @api {delete} /user Delete user
     * @apiGroup User
     * @apiHeader {String} Authorization Valid JSON Web Token
     * @apiHeaderExample {json} Header-Example:
     *     {
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
            }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 204 No Content
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 412 Precondition Failed
     */
    .delete((req, res) => {
      Users.destroy({
        where: { id: req.user.id },
      })
        .then(() => res.sendStatus(204))
        .catch((error) => {
          res.status(412).json({ message: error.message });
        });
    });

  /**
   * @api {post} /users Create user
   * @apiGroup User
   * @apiParam {String} name User's name
   * @apiParam {String} email User's email
   * @apiParam {String} password User's password
   * @apiParamExample {json} Request-Example:
   * {
   *   "name": "Huyen",
   *   "email": "huyen@gmail.com",
   *   "password": "123456"
   * }
   * @apiSuccess {Number} id User's id
   * @apiSuccess {String} name User's name
   * @apiSuccess {String} email User's email
   * @apiSuccess {String} password User's encrypted password
   * @apiSuccess {Date} createdAt User's creation date
   * @apiSuccess {Date} updatedAt User's last update
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "id": 1,
   *       "name": "Huyen",
   *       "email": "huyen@gmail.com",
   *       "password": "$2a$10$SK1B1",
   *       "createdAt": "2019-01-01T00:00:00.000Z",
   *       "updatedAt": "2019-01-01T00:00:00.000Z"
   *     }
   */
  app.post("/users", (req, res) => {
    Users.create(req.body)
      .then((result) => res.json(result))
      .catch((error) => {
        res.status(412).json({ message: error.message });
      });
  });
};
