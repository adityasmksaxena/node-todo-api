import { ObjectID } from 'mongodb';
import jwt from 'jsonwebtoken';

import Todo from '../../models/todo';
import User from '../../models/user';

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
export const users = [
  {
    _id: userOneId,
    email: 'adityasmksaxena@gmail.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId, access: 'auth' }, '123ABC').toString(),
    }],
  }, {
    _id: userTwoId,
    email: 'adityasmksaxena@yahoo.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userTwoId, access: 'auth' }, '123ABC').toString(),
    }],
  },
];

export const todos = [
  {
    _id: new ObjectID(),
    text: 'Todo 1',
    _creator: userOneId,
  }, {
    _id: new ObjectID(),
    text: 'Todo 2',
    isCompleted: true,
    completedAt: 4444,
    _creator: userOneId,
  }, {
    _id: new ObjectID(),
    text: 'Todo 3',
    _creator: userTwoId,
  },
];

export const populateUsers = (done) => {
  User.remove({})
    .then(() => {
      const user1 = new User(users[0]).save();
      const user2 = new User(users[1]).save();
      return Promise.all([user1, user2]);
    }).then(() => done())
    .catch((err) => done(err));
};

export const populateTodos = (done) => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done())
    .catch((err) => done(err));
};
