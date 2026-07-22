import { Project, IProject } from '../models/Project';

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
  async updateProject(id: string, data: Partial<IProject>) {
    const updatedProject = await Project.findByIdAndUpdate(id, data, { new: true });
    
    if (!updatedProject) {
      throw new Error('Project not found in the database.');
    }
    
    return updatedProject;
  }

  //delete project
  async deleteProject(id: string) {
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      throw new Error('Project not found.');
    }
    
    return { message: 'Project successfully deleted.' };
  }
}