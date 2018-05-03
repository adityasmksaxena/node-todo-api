
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minLength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const {_id} = user;
  let token = jwt.sign({
    _id : _id.toHexString(),
    access
  }, '123ABC').toString();
  user.tokens = user.tokens.concat([{access, token}]);
  return user.save()
  .then(() => token)
};

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const {_id, email} = userObject;
  return {_id, email};
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, '123ABC');
  } catch (err) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
};

const User = mongoose.model('User', UserSchema);

export default User;