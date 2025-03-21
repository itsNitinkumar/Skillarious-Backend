import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { UploadedFile } from 'express-fileupload';
import path from 'path';

dotenv.config();

// Create Supabase client with realtime enabled
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Initialize realtime channels
const doubtChannel = supabase.channel('doubt-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'doubts'
    },
    (payload) => {
      console.log('Doubt change:', payload);
    }
  )
  .subscribe();

const messageChannel = supabase.channel('message-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('Message change:', payload);
    }
  )
  .subscribe();

// Existing Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export { doubtChannel, messageChannel };

export const uploadMedia = async (file: UploadedFile) => {
  try {
    // Validate file
    if (!file || !file.tempFilePath) {
      throw new Error('Invalid file object');
    }

    // Set upload options based on file type
    const cleanFileName = file.name
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: 'auto',
      folder: 'skillarious/materials',
      public_id: `${Date.now()}-${cleanFileName}`,
      unique_filename: true,
  
    });

    return {
      fileName: file.name,
      tempPath: file.tempFilePath,
      mimeType: file.mimetype,
      size: file.size,
      url: result.secure_url,
      public_id: result.public_id,
    };

  } catch (error: any) {
    // Detailed error logging
    console.error('Cloudinary Upload Error:', {
      error: error.message,
      details: error.error || error,
      file: file.name,
      tempPath: file.tempFilePath
    });

    throw new Error(`Upload failed: ${error.message}`);
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



