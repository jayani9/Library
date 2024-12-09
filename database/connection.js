import mongoose from "mongoose";
import 'dotenv/config'

async function connect() {
  try {
    if (!process.env.DB_URI) {
      throw new Error("DB_URI is not defined in environment variables.");
    }

    const db = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message || error);
    throw error;
  }
}

export default connect;
