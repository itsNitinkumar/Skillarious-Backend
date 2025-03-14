import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { doubtsTable, messagesTable } from '../db/schema.ts';
import { supabase } from '../utils/storage.ts';
import { sendEmail } from '../utils/sendEmail.ts';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  }
}

export const createDoubt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId, title, description } = req.body;
    const userId = req.user.id; // Now TypeScript knows about user property     

    const newDoubt = await db.insert(doubtsTable).values({
      date: new Date(),
      message: description, // Use description as the message
      contentId,
      userId,
      title,
      description,
      status: 'open'
    }).returning();

    // Notify educator through Supabase realtime
    await supabase
      .from('doubts')
      .insert([{ ...newDoubt[0], type: 'new_doubt' }]);

    // Send email notification
    const educatorEmail = 'educator@example.com'; // Get this from your database
    await sendEmail(
      educatorEmail,
      'New Doubt Posted',
      `A new doubt "${title}" has been posted in your course`
    );

    return res.status(201).json({
      success: true,
      data: newDoubt[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating doubt'
    });
  }
};

export const replyToDoubt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doubtId, content } = req.body;
    // const userId = req.user.id;

    const newMessage = await db.insert(messagesTable).values({
      doubtId,
      text: content,
      isResponse: true
    }).returning();

    // Notify through Supabase realtime
    await supabase
      .from('messages')
      .insert([{ ...newMessage[0], type: 'new_message' }]);

    return res.status(201).json({
      success: true,
      data: newMessage[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error replying to doubt'
    });
  }
};