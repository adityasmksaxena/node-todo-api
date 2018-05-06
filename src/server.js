import express from 'express';
import { ObjectId } from 'mongodb';
import bodyParser from 'body-parser';

import authenticate from './middleware/authenticate';

import User from './models/user';
import Todo from './models/todo';

require('./config/config');
require('./db/mongoose');


const port = process.env.PORT;
const app = express();
app.use(bodyParser.json());


// Todos Related Routes

app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });
  todo.save()
    .then((doc) => {
      res.send(doc);
    }).catch((err) => {
      res.status(400).send({ err });
    });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then((todos) => {
      res.send({ todos });
    }).catch((err) => {
      res.status(400).send({ err });
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findOne({ _id: id, _creator: req.user._id })
    .then((todo) => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    }).catch((err) => {
      res.status(400).send({ err });
    });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findByIdAndRemove(id)
    .then((todo) => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    }).catch((err) => {
      res.status(400).send({ err });
    });
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  let { isCompleted } = req.body;
  let completedAt = null;
  if (!ObjectId.isValid(id)) return res.status(404).send();
  if (typeof (isCompleted) === typeof (true) && isCompleted) {
    completedAt = new Date().getTime();
  } else {
    isCompleted = false;
  }
  Todo.findByIdAndUpdate(id, {
    $set: {
      text,
      isCompleted,
      completedAt,
    },
  }, {
    new: true,
  }).then((todo) => {
    if (!todo) {
      res.status(404).send();
      return;
    }
    res.send({ todo });
  }).catch((err) => {
    res.status(400).send(err);
  });
});


// User Related Routes

app.post('/users', (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user.save()
    .then(() => user.generateAuthToken())
    .then((token) => {
      res.header('x-auth', token).send({ user });
    }).catch((err) => {
      res.status(400).send(err);
    });
});

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;
  User.findByCredentials(email, password)
    .then((user) => user.generateAuthToken()
      .then((token) => {
        res.header('x-auth', token).send({ user });
      })).catch(() => {
      res.status(400).send();
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.send();
    }).catch(() => {
      res.status(400).send();
    });
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default app;
