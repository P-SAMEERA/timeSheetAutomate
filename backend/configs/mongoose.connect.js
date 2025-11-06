import mongoose from 'mongoose';

export default async function mongoDbConnect(URL){

    try {
        // console.log("MongoDB URL:", process.env.URL);
       await  mongoose.connect(process.env.URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
    } catch (error) {
        console.log(error.message);
    }
}