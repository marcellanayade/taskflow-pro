import mongoose, { Schema, Document } from 'mongoose';

//autocomplete 
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; 
  createdAt: Date;
}

//rules for db
const userSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'A username is required!'] 
  },
  email: { 
    type: String, 
    required: [true, 'An email address is required!'],
    unique: true,   
    lowercase: true
  },
  password: { 
    type: String, 
    required: [true, 'A password is required!'],
    select: false //password safe
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const User = mongoose.model<IUser>('User', userSchema);