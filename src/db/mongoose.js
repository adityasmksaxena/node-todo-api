import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

import dotenv from 'dotenv';
const res = dotenv.config();
if (res.error) throw res.error

mongoose.connect( process.env.MONGODB_URI );

export default mongoose;