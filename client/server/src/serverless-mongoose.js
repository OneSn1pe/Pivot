// serverless-mongoose.js
const mongoose = require("mongoose");

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  cachedConnection = connection;
  console.log("Connected to MongoDB successfully");
  return connection;
}

module.exports = { connectToDatabase };
