import mongoose, { Schema, Document } from 'mongoose';

//
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: mongoose.Types.ObjectId;    //project ref
  assignedTo?: mongoose.Types.ObjectId; //user ref
  dueDate?: Date;                       //delivery date
  createdAt: Date;
}

//rules for db
const taskSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'The task title is required!'],
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'in_progress', 'completed'],
      message: 'Status {VALUE} is not supported by the system!'
    },
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority {VALUE} is not supported!'
    },
    default: 'medium' 
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, 'Every task must be linked to a project!'] 
  },
  assignedTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  dueDate: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Task = mongoose.model<ITask>('Task', taskSchema);