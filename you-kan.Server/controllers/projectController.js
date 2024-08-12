const { Project, ProjectUser, User } = require('../models');

// CRUD for PROJECTS
const getProject = async (req, res) => {
    try {
      const requesterUserId = req.user.user_id;
  
      // Validate that the requesterUserId is provided
      if (!requesterUserId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      // Check if the requester is allowed to view projects of the target user
      const project = await Project.findOne({
        where: { creator_user_id: requesterUserId }
      });
  
      if (!project) {
        return res.status(404).json({ error: 'No projects found for the user' });
      }
  
      if (project.creator_user_id !== parseInt(requesterUserId, 10)) {
        return res.status(403).json({ error: 'User does not have permission to view these projects' });
      }
  
      // Fetch projects where creator_user_id matches requesterUserId
      const projects = await Project.findAll({
        where: { creator_user_id: requesterUserId }
      });
  
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
const getProjectById = async (req, res) => {
    try {
      const requesterUserId = req.user.user_id;
      const projectId = req.params.id;
  
      // Validate that the requesterUserId is provided
      if (!requesterUserId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      // Fetch the project to check if it exists and to get the creator_user_id
      const project = await Project.findByPk(projectId);
  
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Check if the requester has permission to view the project
      if (project.creator_user_id !== parseInt(requesterUserId, 10)) {
        return res.status(403).json({ error: 'User does not have permission to view this project' });
      }
  
      // If the user has permission, return the project details
      res.json(project);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
const createProject = async (req, res) => {
  const { project_name } = req.body;
  const creator_user_id = req.user.user_id;

  try {
  // Check if the project name is already used by this user
  const existingProject = await Project.findOne({
    where: {
      project_name,
      creator_user_id
    }
  });

  if (existingProject) {
    return res.status(400).json({ error: 'Project name already used by this user' });
  }

    // Create the project
    const project = await Project.create({
      project_name,
      creator_user_id
    });

    // Associate the project with the user
    await ProjectUser.create({
      user_id: creator_user_id,
      project_id: project.project_id
    });

    res.status(201).send('Project created and associated with user successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
    
  
const updateProject = async (req, res) => {
  try {
    const requesterUserId = req.user.user_id;
    const projectId = req.params.id;
    const { project_name } = req.body;

    // Validate that the requesterUserId is provided
    if (!requesterUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch the project to check if it exists and to get the creator_user_id
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if the requester has permission to view the project
    if (project.creator_user_id !== parseInt(requesterUserId, 10)) {
      return res.status(403).json({ error: 'User does not have permission to view this project' });
    }

    // Check if the new project name is already used by this user
    if (project_name !== project.project_name) {
      const existingProject = await Project.findOne({
        where: {
          project_name,
          creator_user_id: requesterUserId
        }
      });

      if (existingProject) {
        return res.status(400).json({ error: 'Project name already used by this user' });
      }
    }
  
      const [updated] = await Project.update(req.body, {
        where: { project_id: projectId}
      });
      if (updated) {
        res.json({ message: 'Project updated' });
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
const deleteProject = async (req, res) => {
  try {
    const requesterUserId = req.user.user_id;
    const projectId = req.params.id;

    // Validate that the requesterUserId is provided
    if (!requesterUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch the project to check if it exists and to get the creator_user_id
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if the requester has permission to view the project
    if (project.creator_user_id !== parseInt(requesterUserId, 10)) {
      return res.status(403).json({ error: 'User does not have permission to view this project' });
    }

    // First, delete associated records in the Project_Users table
    await ProjectUser.destroy({
        where: { project_id: projectId }
        });

    // Then, delete the project
    const deleted = await Project.destroy({
      where: { project_id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Project deleted' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Function to get all collaborators for a specific project
const getCollaborator = async (req, res) => {
  const project_id = req.params.id;

  try {
    const collaborators = await ProjectUser.findAll({
      where: { project_id },
      attributes: ['user_id']
    });

    if (!collaborators.length) {
      return res.status(404).json({ message: 'Project not found or no collaborators' });
    }

    const userIds = collaborators.map(collaborator => collaborator.user_id);

    res.status(200).json({ userIds }); // returns array of user_id
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to add a collaborator to a project
const addCollaborator = async (req, res) => {
  console.log('TEST')
  const project_id = req.params.id;
  const { user_id } = req.query; 

  try {
    // Check if the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the user by id
    const user = await User.findOne({ where: { user_id } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already a collaborator
    const existingCollaborator = await ProjectUser.findOne({
      where: { project_id, user_id }
    });

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add the new collaborator
    await ProjectUser.create({
      project_id,
      user_id
    });

    res.status(201).json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to remove a collaborator from a project
const removeCollaborator = async (req, res) => {
  const project_id = req.params.id;
  const { user_id } = req.query; // Retrieve the email from the request body
  const requesterUserId = req.user.user_id; // Get the requester’s user ID from the authenticated user

  try {
    // Check if the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the requester is the creator of the project
    if (project.creator_user_id !== requesterUserId) {
      return res.status(403).json({ message: 'User does not have permission to remove collaborators from this project' });
    }

    // Find the user by email
    const user = await User.findOne({ where: { user_id } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is a collaborator
    const existingCollaborator = await ProjectUser.findOne({
      where: { project_id, user_id }
    });

    if (!existingCollaborator) {
      return res.status(404).json({ message: 'User is not a collaborator of this project' });
    }

    // Remove the collaborator
    await ProjectUser.destroy({
      where: { project_id, user_id }
    });

    res.status(200).json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

  module.exports = { getProject, getProjectById, createProject, deleteProject, updateProject, getCollaborator, addCollaborator, removeCollaborator};