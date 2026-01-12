import mongoose, { mongo } from "mongoose";

async function connectionDb() {
  mongoose.connect(process.env.DB_CONNECTION);
  return mongoose.connection;
}

export default connectionDb;