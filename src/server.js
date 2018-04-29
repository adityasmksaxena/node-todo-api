import express from 'express';
import mongoose from './db/mongoose';
import {ObjectId} from 'mongodb';

import bodyParser from 'body-parser';

import User from './models/user';
import Todo from './models/todo';

// console.log(global);
// console.log(process);
// console.log(module);
// console.log(process.env.SEC);

let app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });
  todo.save()
  .then((doc) => {
    res.send(doc);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', (req, res) => {
  Todo.find()
  .then((todos) => {
    res.send({todos});
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findById(id)
  .then((todo) => {
    if(!todo) return res.status(404).send();
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default app;


