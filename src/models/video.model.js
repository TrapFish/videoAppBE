import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema({
    videoFile: {
        type: String, //Cloudinary URL
        required: true,
    },
    thumbnail: {
        type: String, //Cloudinary URL
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    discription: {
        type: String, 
        required: true,
    },
    duration: {
        type: Number, // Cloudinary duration in seconds
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    isOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);
export default  Video = mongoose.model("Video", videoSchema);