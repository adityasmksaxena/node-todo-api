import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

import dotenv from 'dotenv';

const res = dotenv.config();
if (res.error) throw res.error

let db = {
  localhost: 'mongodb://localhost:27018/TodoApp',
  mlab: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ds263619.mlab.com:63619/todo-app`
};

mongoose.connect( process.env.PORT ? db.mlab : db.localhost );

export default mongoose;