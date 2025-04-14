import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    console.log(userId)
    const { name, phone, gender, age ,pfp} = req.body;
    console.log(req.body)

    // Validate required fields
    if (!name ) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Validate phone format if provided
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be either male, female, or other'
      });
    }

    // Validate age if provided
    if (age) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum)) {
        return res.status(400).json({
          success: false,
          message: 'Age must be a number'
        });
      }
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!existingUser.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create update object with only defined values
    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (pfp !== undefined) updateData.pfp = pfp;

    // Update user profile
    const updatedUser = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();


      
   
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive information
    const { password, refreshToken, ...userProfile } = user[0];

    return res.status(200).json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};



