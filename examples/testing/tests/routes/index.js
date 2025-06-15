describe("Index Routes", () => {
  describe("GET /", () => {
    it("should return the API status", (done) => {
      request
        .get("/")
        .expect(200)
        .end((err, res) => {
          const expected = { status: "NTask API" };
          expect(res.body).to.deep.equal(expected);
          done(err);
        });
    });
  });
});
