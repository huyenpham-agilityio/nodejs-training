const jwt = require("jwt-simple");

describe("Task Routes", () => {
  const Tasks = app.db.models.tasks;
  const Users = app.db.models.users;
  const jwtSecret = app.libs.config.jwtSecret;
  let token;
  let fakeTask;

  beforeEach(async () => {
    await Users.destroy({ where: {} });

    const user = await Users.create({
      name: "Huyen",
      email: "huyen@gmail.com",
      password: "123456",
    });

    await Tasks.destroy({ where: {} });

    const tasks = await Tasks.bulkCreate([
      { id: 1, title: "Task1", done: false, userId: user.id },
      { id: 2, title: "Task2", done: false, userId: user.id },
    ]);

    fakeTask = tasks[0];
    token = jwt.encode({ id: user.id }, jwtSecret);
  });

  it("GET /tasks: should return a list of tasks", async () => {
    const res = await request
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.have.length(2);
    expect(res.body[0].title).to.equal(fakeTask.title);
    expect(res.body[0].done).to.equal(fakeTask.done);
  });

  it("POST /tasks: should create a new task", async () => {
    const res = await request
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task3",
        done: false,
      })
      .expect(200);

    expect(res.body.title).to.equal("Task3");
    expect(res.body.done).to.be.false;
  });

  it("GET /tasks/:id: should return a task", async () => {
    const res = await request
      .get("/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.title).to.equal(fakeTask.title);
    expect(res.body.done).to.equal(fakeTask.done);
  });

  it("PUT /tasks/:id: should update a task", async () => {
    await request
      .put("/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        done: true,
      })
      .expect(204);

    const updatedTask = await Tasks.findByPk(1);
    expect(updatedTask.done).to.be.true;
  });

  it("DELETE /tasks/:id: should delete a task", async () => {
    await request
      .delete("/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const deletedTask = await Tasks.findByPk(1);
    expect(deletedTask).to.be.null;
  });
});
