import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME||"ddd1uwi0b", 
  api_key: process.env.CLOUDINARY_API_KEY||"426554976957614", 
  api_secret: process.env.CLOUDINARY_API_SECRET||"F1-Kv4pJrkPlGdD78KJUm2K1n4s"
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        if (!fs.existsSync(localFilePath)) {
          return null;
      }
        //upload the file on cloudinary
        let response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.log("Error uploading file on cloudinary ", error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}