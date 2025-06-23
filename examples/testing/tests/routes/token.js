describe("Token Routes", () => {
  const Users = app.db.models.users;

  beforeEach(async () => {
    await Users.destroy({ where: {} });

    await Users.create({
      name: "Huyen",
      email: "huyen@gmail.com",
      password: "123456",
    });
  });

  it("POST /token: should return a token", (done) => {
    request
      .post("/token")
      .send({ email: "huyen@gmail.com", password: "123456" })
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.include.keys("token");
        done(err);
      });
  });

  it("POST /token: should throw error when password is invalid", (done) => {
    request
      .post("/token")
      .send({ email: "huyen@gmail.com", password: "1234567" })
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.deep.equal({ error: "Invalid credentials" });
        done(err);
      });
  });

  it("POST /token: should throw error when email is invalid", (done) => {
    request
      .post("/token")
      .send({ email: "huyen@gmail", password: "123456" })
      .expect(401)
      .end((err, res) => {
        expect(res.body).to.deep.equal({ error: "Invalid credentials" });
        done(err);
      });
  });

  it("POST /token: should throw error when email and password are blank", (done) => {
    request
      .post("/token")
      .send({ email: "", password: "" })
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.deep.equal({
          message: "Email and password are required",
        });
        done(err);
      });
  });

  it("POST /token: should throw error when email and password are not provided", (done) => {
    request
      .post("/token")
      .expect(500)
      .end((err, res) => {
        done(err);
      });
  });
});
