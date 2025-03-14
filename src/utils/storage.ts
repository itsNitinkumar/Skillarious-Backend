import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadMedia = async (file: any, type: 'video' | 'image' | 'document') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: type === 'video' ? 'video' : 'auto',
      folder: `eduplatform/${type}s`
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error}`);
  }
};

export const deleteMedia = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    return true;
  } catch (error) {
    throw new Error(`Error deleting from Cloudinary: ${error}`);
  }
};