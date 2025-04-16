//require("dotenv").config();
import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: '../.env'
});
connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch(e =>{
    console.log("Error connecting to MongoDB:", e.message);

})

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
// import express from "express";
// const app = express();

// (async ()=>{
//    try {
//     await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });

//     app.on("error", (err) => {
//         console.log("Error connecting to MongoDB:", err.message);
//     });

//     app.listen(process.env.PORT, () => {
//         console.log(`Server is running on port ${process.env.PORT}`);
//     });

//    } catch (error) {
//     console.log("Error connecting to MongoDB:", error.message);
//    }
// })()