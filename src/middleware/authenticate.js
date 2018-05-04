import User from "../models/user";

const authenticate = (req, res, next) => {
  let token = req.header('x-auth');
  User.findByToken(token)
  .then((user) => {
    if(!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch(() => {
    res.status(401).send();
  });
};

export default authenticate;