import expect from 'expect';
import request from 'supertest';

import app from '../server';
import Todo from '../models/todo';


const todos = [
  {
    text: "Todo 1"
  }, {
    text: "Todo 2"
  }, {
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