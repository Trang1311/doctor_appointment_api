import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const allowedFormats = ['png', 'jpg', 'jpeg', 'gif'];
    const fileExtension = file.mimetype.split('/')[1];

    if (!allowedFormats.includes(fileExtension)) {
      throw new Error('File format not allowed');
    }

    return {
      folder: 'user-images',
      format: fileExtension,
      public_id: file.originalname,
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
      overwrite: true,
    };
  },
});
