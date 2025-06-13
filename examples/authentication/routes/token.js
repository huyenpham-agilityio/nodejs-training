const jwt = require("jwt-simple");

module.exports = (app) => {
  const Users = app.db.models.users;
  const config = app.libs.config;

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
