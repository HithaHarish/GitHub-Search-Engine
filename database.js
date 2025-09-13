// database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://myAtlasDBUser:MLH_GHW@myatlasclusteredu.i9dhlz8.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
