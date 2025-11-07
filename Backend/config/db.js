// import mongoose from "mongoose";

// const connectedDB = async () => {
//   try {
//     await mongoose.connect(process.env.MongoDB_URI);
//     console.log("✅ MongoDB Connected Sucessfully");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed", error);
//     process.exit(1); // Stop server if DB connection fails
//   }
// };

// export default connectedDB;


<<<<<<< HEAD



=======
>>>>>>> c36930517565bd4259133295607a32531f8ac70c
import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("🟢 MongoDB already connected");
    return;
  }

  try {
<<<<<<< HEAD
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

=======
    const conn = await mongoose.connect(process.env.MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
>>>>>>> c36930517565bd4259133295607a32531f8ac70c
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
<<<<<<< HEAD
    process.exit(1);
=======
    throw new Error("MongoDB Connection Failed");
>>>>>>> c36930517565bd4259133295607a32531f8ac70c
  }
};

export default connectDB;
<<<<<<< HEAD
=======

>>>>>>> c36930517565bd4259133295607a32531f8ac70c
