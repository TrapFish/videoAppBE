import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    const dataName= 'mongodb+srv://diCoffee:April1992@cluster0.fsxepoy.mongodb.net'
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI || dataName}/${DB_NAME}`);
    } catch (error) {
        console.error("Error connecting to MongoDB :", error.message);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;