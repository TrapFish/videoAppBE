import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber : {
        type: mongoose.Schema.Types.ObjectId,//one who is Subscribing
        ref: "User"
    },
    channel : {
        type: mongoose.Schema.Types.ObjectId,//one who is being Subscribed
        ref: "User" 
    }
}, { timestamps: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);