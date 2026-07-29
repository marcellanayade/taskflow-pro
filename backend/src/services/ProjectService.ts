import { Project, IProject } from '../models/Project';
import { Task } from '../models/Task'; 
import { User } from '../models/User';

export class ProjectService {
  
  //new project
  async createProject(data: Partial<IProject>) {
    if (!data.name) {
      throw new Error('The project name is required.');
    }
    
    const newProject = await Project.create(data);
    return newProject;
  }

  //get all projects where user is owner or member
  async getAllProjects(userId: string) {
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).populate('owner', 'name email').populate('members', 'name email');
    
    return projects;
  }

  //get project and ensure caller is owner or member
  async getProjectById(id: string, userId: string) {
    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email'); 
    
    if (!project) {
      throw new Error('Project not found.');
    }

    //only owner or member can view
    const isOwner = project.owner._id.toString() === userId;
    const isMember = project.members.some(member => member._id.toString() === userId);

    if (!isOwner && !isMember) {
      throw new Error('Unauthorized to access this project.');
    }
    
    return project;
  }

  // update project (only owner)
  async updateProject(id: string, userId: string, data: Partial<IProject>) {
    // ensure only the owner can update by checking both id and owner
    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, owner: userId },
      data,
      { new: true }
    );
    
    if (!updatedProject) {
      throw new Error('Project not found or unauthorized.');
    }
    
    return updatedProject;
  }

  //delete project (only owner)
  async deleteProject(id: string, userId: string) {
    //ensure only the owner can delete
    const deletedProject = await Project.findOneAndDelete({ _id: id, owner: userId });
    
    if (!deletedProject) {
      throw new Error('Project not found or unauthorized.');
    }
    
    //delete all tasks belonging to this project
    await Task.deleteMany({ project: id }); 
    
    return { message: 'Project successfully deleted.' };
  }

  //invite a member by email (only owner)
  async addMemberByEmail(projectId: string, ownerId: string, memberEmail: string) {
    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
      throw new Error('Project not found or you are not the owner.');
    }

    const userToAdd = await User.findOne({ email: memberEmail });
    if (!userToAdd) {
      throw new Error('User with this email was not found.');
    }

    //avoid adding owner as member
    if (userToAdd._id.toString() === ownerId) {
      throw new Error('You are already the owner of this project.');
    }

    //avoid duplicate members
    if (project.members.includes(userToAdd._id as any)) {
      throw new Error('User is already a member of this project.');
    }

    project.members.push(userToAdd._id as any);
    await project.save();

    return project;
  }
}