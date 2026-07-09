import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId; //mongodb id
  createdAt: Date;
}

//rules for db
const projectSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'The project name is required!'],
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  owner: { 
    type: Schema.Types.ObjectId, //id from another doc
    ref: 'User',                 //this id belongs to 'User'
    required: [true, 'The project must belong to a user!']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Project = mongoose.model<IProject>('Project', projectSchema);