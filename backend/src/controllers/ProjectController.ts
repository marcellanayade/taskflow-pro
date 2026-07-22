import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AuthRequest } from '../middlewares/authMiddleware';

const projectService = new ProjectService();

export class ProjectController {
  
  async create(req: AuthRequest, res: Response) {
    try {
      //get project data and add owner (from JWT token)
      const projectData = {
        ...req.body,
        owner: req.userId 
      };

      const newProject = await projectService.createProject(projectData);
      return res.status(201).json(newProject);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      //fetch only projects belonging to this specific owner
      const projects = await projectService.getAllProjects(req.userId as string);
      return res.status(200).json(projects);
    } catch (error: any) {
      return res.status(500).json({ error: 'An error occurred while retrieving projects.' });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id as string);
      return res.status(200).json(project);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const projectData = req.body;
      const updatedProject = await projectService.updateProject(id as string, projectData);
      return res.status(200).json(updatedProject);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}