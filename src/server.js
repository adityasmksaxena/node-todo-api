require('./config/config');

import express from 'express';
import {ObjectId} from 'mongodb';
import bodyParser from 'body-parser';

import authenticate from './middleware/authenticate';

require('./db/mongoose');
import User from './models/user';
import Todo from './models/todo';

const port = process.env.PORT;
let app = express();
app.use(bodyParser.json());


// Todos Related Routes

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });
  todo.save()
  .then((doc) => {
    res.send(doc);
  }).catch((err) => {
    res.status(400).send({err});
  });
});

app.get('/todos', (req, res) => {
  Todo.find()
  .then((todos) => {
    res.send({todos});
  }).catch((err) => {
    res.status(400).send({err});
  });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findById(id)
  .then((todo) => {
    if(!todo) {
      res.status(404).send();
      return;
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send({err});
  })
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findByIdAndRemove(id)
  .then((todo) => {
    if(!todo) return res.status(404).send();
    res.send({todo});
  }).catch((err) => {
    res.status(400).send({err});
  })
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  let {text, isCompleted} = req.body;
  let completedAt = null;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  if(typeof(isCompleted) === typeof(true) && isCompleted) {
    completedAt = new Date().getTime();
  } else {
    isCompleted = false;
  }
  Todo.findByIdAndUpdate(
    id, {
      $set: {
        text,
        isCompleted,
        completedAt
      }
    }, {
      new: true
    }
  ).then((todo) => {
    if(!todo) {
      res.status(404).send();
      return;
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send(err);
  });
});


// User Related Routes

app.post('/users', (req, res) => {
  const {email, password} = req.body;
  const user = new User({email, password});
  user.save()
  .then((user) => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({user});
  }).catch((err) => {
    res.status(400).send(err);
  });
});



app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});



app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default app;


