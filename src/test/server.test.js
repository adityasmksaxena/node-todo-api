import expect from 'expect';
import { ObjectID } from 'mongodb';
import request from 'supertest';

import app from '../server';
import User from '../models/user';
import Todo from '../models/todo';

import { users, todos, populateUsers, populateTodos } from './seed/seed';

beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        console.log(5);
        if(err) return done(err);
        Todo.find({ text })
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((err) => done(err));
      });
  });
  it('should not create a todo with invalid data',(done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return done(err);
        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(3);
            done();
          }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      }).end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    const hexId = todos[0]._id.toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      }).end(done);
  });
  it('should not return a todo doc created by other user', (done) => {
    const hexId = todos[2]._id.toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if id is invalid', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
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
      }).end((err, res) => {
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
          });
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
      }).expect(200)
      .expect((res) => {
        let {text, isCompleted, completedAt} = res.body.todo;
        expect(text).toBe(newText);
        expect(isCompleted).toBe(true);
        expect(typeof(completedAt)).toBe('number');
      }).end(done);
  });
  it('should clear completedAt when todo is not completed', (done) => {
    const id = todos[2]._id.toHexString();
    const newText = 'Todo11';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text: newText,
        isCompleted: false
      }).expect(200)
      .expect((res) => {
        const { text, isCompleted, completedAt } = res.body.todo;
        expect(text).toBe(newText);
        expect(isCompleted).toBe(false);
        expect(completedAt).toBeFalsy();
      }).end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'test@example.com';
    let password = '12345678';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy();
        expect(res.body.user._id).toBeTruthy();
        expect(res.body.user.email).toBe(email);
      }).end((err) => {
        if(err) return done(err);
        User.findOne({email})
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          }).catch((e) => done(e));
      });
  });
  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'abc',
        password: "84321"
      }).expect(400)
      .end(done);
  });
  it('should not create a user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: '12345678'
      }).expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    const { email, password } = users[1];
    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy();
      }).end((err, res) => {
        if(err) return done(err);
        User.findById(users[1]._id)
          .then((user) => {
            // expect(user.tokens[1]).toInclude({
            //   access: 'auth',
            //   token: res.header['x-auth']
            // });
            done();
          }).catch((e) => done(e));
      });
  });
  it('should reject invalid login attempt', (done) => {
    const { email, password } = users[1];
    request(app)
      .post('/users/login')
      .send({email, password: password + '1'})
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toBeFalsy();
      }).end((err, res) => {
        if(err) return done(err);
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err) return done(err);
        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((err) => done(err));
      });
  });
});