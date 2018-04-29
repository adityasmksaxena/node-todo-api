let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27018/TodoApp');
mongoose.connect(`mongodb://adityasmksaxena:HarioM5!@ds119688.mlab.com:19688/node-todo-api`);

export default mongoose;