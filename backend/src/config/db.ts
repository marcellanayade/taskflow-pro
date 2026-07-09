import mongoose from 'mongoose';

export const connectDB = async () => {
  try {

    const mongoURI = process.env.DATABASE_URL;

    if (!mongoURI) {
      throw new Error("Error: DATABASE_URL has not been defined in the .env file!");
    }

    const connection = await mongoose.connect(mongoURI);

    console.log(`Database successfully connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};