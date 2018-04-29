import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

let db = {
  localhost: 'mongodb://localhost:27018/TodoApp',
  mlab: `mongodb://${process.env.dbUsername}:${process.env.dbPassword}@ds263619.mlab.com:63619/todo-app`
};

mongoose.connect( process.env.PORT ? db.mlab : db.localhost );

export default mongoose;