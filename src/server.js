import express from 'express';
import {ObjectId} from 'mongodb';
import bodyParser from 'body-parser';

import mongoose from './db/mongoose';
import User from './models/user';
import Todo from './models/todo';

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
  let id = req.params.id;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findById(id)
  .then((todo) => {
    if(!todo) return res.status(404).send();
    res.send({todo});
  }).catch((err) => {
    res.status(400).send({err});
  })
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  if(!ObjectId.isValid(id)) return res.status(404).send();
  Todo.findByIdAndRemove(id)
  .then((todo) => {
    if(!todo) return res.status(404).send();
    res.send({todo});
  }).catch((err) => {
    res.status(400).send({err});
  })
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default app;


