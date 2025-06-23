const jwt = require("jwt-simple");

module.exports = (app) => {
  const Users = app.db.models.users;
  const config = app.libs.config;

  /**
   * @api {post} /token Authentication Token
   * @apiGroup Credentials
   * @apiParam {String} email User's email
   * @apiParam {String} password User's password
   * @apiParamExample {json} Request-Example:
   * {
   *   "email": "test@example.com",
   *   "password": "123456"
   * }
   * @apiSuccess {String} token User's token
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTQ4NjE2MjI4fQ.2vKZ7a9H2lUw3Mq4fK5a6g7b8c9d0e1f"
   *     }
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 401 Unauthorized
   */
  app.post("/token", async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      try {
        const user = await Users.findOne({
          where: { email },
          attributes: ["id", "password"],
        });

        if (!user || !user.isPassword(password)) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        const payload = {
          id: user.id,
        };
        const token = jwt.encode(payload, config.jwtSecret);
        res.json({ token });
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.status(400).json({ message: "Email and password are required" });
    }
  });
};
