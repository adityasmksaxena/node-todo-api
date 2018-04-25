const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27018/TodoApp', (err, client) => {
  if(err) {
    console.log('unable to connect to mongodb');
    return;
  }
  console.log('Connected to Mongo Db server');
  const db = client.db('TodoApp');
  
  
  db.collection('Todos').insertOne({
    text: 'Something to Do',
    completed: false
  }, (err, result) => {
    if(err) {
      console.log('error inserting record');
      return;
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  })
  
  client.close();
});
