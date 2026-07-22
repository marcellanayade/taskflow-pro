import { Project, IProject } from '../models/Project';
import { Task } from '../models/Task'; 

export class ProjectService {
  
  //new project
  async createProject(data: Partial<IProject>) {
    if (!data.name) {
      throw new Error('The project name is required.');
    }
    
    const newProject = await Project.create(data);
    return newProject;
  }

  //get all projects from a specific owner
  async getAllProjects(userId: string) {
    const projects = await Project.find({ owner: userId });
    return projects;
  }

  async getProjectById(id: string) {
    const project = await Project.findById(id); 
    
    if (!project) {
      throw new Error('Project not found.');
    }
    
    return project;
  }

  //update project
  async updateProject(id: string, userId: string, data: Partial<IProject>) {
    //ensure only the owner can update by checking both id and owner
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

  //delete project
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
}