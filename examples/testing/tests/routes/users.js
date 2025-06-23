const jwt = require("jwt-simple");

describe("Users Routes", () => {
  const Users = app.db.models.users;
  const jwtSecret = app.libs.config.jwtSecret;
  let token;

  beforeEach(async () => {
    await Users.destroy({ where: {} });

    const user = await Users.create({
      name: "Huyen",
      email: "huyen@gmail.com",
      password: "123456",
    });

    token = jwt.encode({ id: user.id }, jwtSecret);
  });

  it("GET /user: should return an authenticated user", async () => {
    const res = await request
      .get("/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.name).to.equal("Huyen");
    expect(res.body.email).to.equal("huyen@gmail.com");
  });

  it("POST /users: should create a new user", async () => {
    const res = await request
      .post("/users")
      .send({ name: "Test User", email: "test@gmail.com", password: "123456" })
      .expect(200);

    expect(res.body.name).to.equal("Test User");
    expect(res.body.email).to.equal("test@gmail.com");
  });

  it("DELETE /user: should delete an authenticated user", async () => {
    await request
      .delete("/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const deletedUser = await Users.findByPk(1);
    expect(deletedUser).to.be.null;
  });
});
