
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

UserSchema.methods.removeToken = function (token) {
  let user = this;
  return user.update({$pull: {tokens: {token}}});
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

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;
  return User.findOne({email})
  .then((user) => {
    if(!user) return Promise.reject();
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) resolve(user);
        reject();
      })
    })
  })
};

UserSchema.pre('save', function (next) {
  const user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else next();
});

const User = mongoose.model('User', UserSchema);

export default User;