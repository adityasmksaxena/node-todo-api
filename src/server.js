import express from 'express';
import mongoose from './db/mongoose';

import bodyParser from 'body-parser';

import User from './models/user';
import Todo from './models/todo';

// console.log(global);
// console.log(process);
// console.log(module);
// console.log(process.env.SEC);

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body);
  
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

app.listen(3001, () => {
  console.log('Started on port 3001');
});


