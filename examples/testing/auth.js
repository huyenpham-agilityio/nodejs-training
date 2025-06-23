const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");

module.exports = (app) => {
  const Users = app.db.models.users;
  const config = app.libs.config;

  const params = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const strategy = new Strategy(params, (payload, done) => {
    Users.findByPk(payload.id)
      .then((user) => {
        if (user) {
          return done(null, {
            id: user.id,
            email: user.email,
          });
        }
        return done(null, false);
      })
      .catch((error) => done(error, false));
  });

  passport.use(strategy);

  return {
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate("jwt", config.jwtSession),
  };
};
