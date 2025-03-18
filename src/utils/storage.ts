import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
      // You can add custom logic here if needed
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
      // You can add custom logic here if needed
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

