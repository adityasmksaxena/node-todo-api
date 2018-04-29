import expect from 'expect';
import {ObjectID} from 'mongodb';
import request from 'supertest';

import app from '../server';
import Todo from '../models/todo';


const todos = [
  {
    _id: new ObjectID(),
    text: "Todo 1"
  }, {
    _id: new ObjectID(),
    text: "Todo 2"
  }, {
    _id: new ObjectID(),
    text: "Todo 3"
  }
];

beforeEach((done) => {
  Todo.remove({})
  .then(() => Todo.insertMany(todos))
  .then(() => done())
  .catch((err => done(err)));
});

describe('POST /todos', () => {
  
  it('should create a new todo', (done) => {
    let text = 'Test todo text';
    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err) return done(err);
      
      Todo.find({text})
      .then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((err) => done(err));
    })
  });
  
  it('should not create a todo with invalid data',(done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err) return done(err);
      Todo.find()
      .then((todos) => {
        expect(todos.length).toBe(3);
        done();
      }).catch((err) => done(err));
    })
  });
  
});

describe('GET /todos', () => {

  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(3);
    })
    .end(done);
  });

});

describe('GET /todos/:id', () => {
  
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });
  
  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
  it('should return 404 for invalid id', (done) => {
    request(app)
    .get('/todos/123abc')
    .expect(404)
    .end(done);
  });
  
});