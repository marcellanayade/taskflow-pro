import { User, IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export class UserService {
  
  //create new user
  async createUser(data: Partial<IUser>) {
    
    //check if email exists
    const userExists = await User.findOne({ email: data.email });
    if (userExists) {
      throw new Error('This email address is already registered in the system.');
    }

    if (!data.password) {
      throw new Error('A password is required.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    //save user with encrypted password 
    const newUser = await User.create({
      ...data, //name + email
      password: hashedPassword 
    });

    //safety cleaning
    const userResponse = newUser.toObject(); 
    delete userResponse.password;            

    return userResponse;
  }

  async login(data: Partial<IUser>) {
    
    //check if email exists
    const user = await User.findOne({ email: data.email }).select('+password');;
    
    if (!user) {
      throw new Error('Incorrect email address or password.');
    }

    //compare passwords
    const isPasswordValid = await bcrypt.compare(data.password as string, user.password as string);
    if (!isPasswordValid) {
      throw new Error('Incorrect email address or password.');
    }

    //generate token
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      secret,                              
      { expiresIn: '1d' }                  //valid for a day
    );

    //send back token and user data without password
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  //handle forgot password request
  async forgotPassword(email: string) {
    // Check if user exists
    const user = await User.findOne({ email });
    
    //do not reveal if the email exists or not
    if (!user) {
      return { message: 'If an account matches that email, a password reset link has been sent.' };
    }

    //generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    //save token and expiration (1 hour) to the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    //setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    //send email
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Taskflow Pro - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Taskflow Pro</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}" target="_blank" style="background-color: #7260e0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return { message: 'If an account matches that email, a password reset link has been sent.' };
  }

  //reset password using token
  async resetPassword(token: string, newPassword: string) {
    //fetch user by token and check its expiration ($gt = greater than)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    if (!newPassword) {
      throw new Error('A new password is required.');
    }

    //encrypt new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password and clear token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password has been successfully reset. You can now log in.' };
  }
}