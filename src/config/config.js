const env = process.env.NODE_ENV || 'development';
// const config = require('./config.json');

if (env === 'development' || env === 'test') {
  // const envConfig = config[env];
  // console.log(envConfig);
  // Object.keys(envConfig).forEach((key) => {
  //   process.env[key] = envConfig[key];
  // });
  process.env.PORT = '3001';
  process.env.MONGODB_URI = 'mongodb://localhost:27018/TodoApp';
  process.env.JWT_SECRET = 'alksDETpAkjfskOPI';
}
