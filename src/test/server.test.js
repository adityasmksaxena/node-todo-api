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
    text: "Todo 2",
    isCompleted: true,
    completedAt: 4444
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
    const text = 'Test todo text';
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
    const hexId = todos[0]._id.toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId);
    })
    .end(done);
  });
  
  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectID().toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
  it('should return 404 if id is invalid', (done) => {
    request(app)
    .get('/todos/123abc')
    .expect(404)
    .end(done);
  });
  
});

describe('DELETE /todos/:id', () => {
  
  it('should remove a todo', (done) => {
    const hexId = todos[0]._id.toHexString();
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err, res) => {
      if(err) {
        done(err);
        return;
      }
      Todo.findById(hexId)
      .then((todo) => {
        expect(todo).toBeFalsy();
        done();
      }).catch((err) => {
        done(err);
      })
    });
  });
  
  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectID().toHexString();
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
  it('should return 404 status if id is invalid', (done) => {
    request(app)
    .delete('/todos/123abc')
    .expect(404)
    .end(done);
  });
  
});

describe('PATCH /todos/:id', () => {
  
  it('should update the todo', (done) => {
    const id = todos[0]._id.toHexString();
    const newText = 'HHHEEELLLOOO';
    request(app)
    .patch(`/todos/${id}`)
    .send({
      text: newText,
      isCompleted: true
    })
    .expect(200)
    .expect((res) => {
      let {text, isCompleted, completedAt} = res.body.todo;
      expect(text).toBe(newText);
      expect(isCompleted).toBe(true);
      expect(typeof(completedAt)).toBe('number');
    })
    .end(done);
  });
  
  it('should clear completedAt when todo is not completed', (done) => {
    const id = todos[2]._id.toHexString();
    const newText = 'Todo11';
    request(app)
    .patch(`/todos/${id}`)
    .send({
      text: newText,
      isCompleted: false
    })
    .expect(200)
    .expect((res) => {
      let {text, isCompleted, completedAt} = res.body.todo;
      expect(text).toBe(newText);
      expect(isCompleted).toBe(false);
      expect(completedAt).toBeFalsy();
    })
    .end(done);
  });
  
});