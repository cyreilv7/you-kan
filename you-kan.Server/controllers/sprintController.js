const { Sprint, Project, User, ProjectUser } = require('../models');

const getSprints = async (req, res) => {
    try {
      const targetProjectId = req.params.projectId; 
      const requesterUserId = req.user.user_id;;

      // Validate that the requesterUserId is provided
      if (!requesterUserId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      //Check if the requester is a collaborator on the target project
      const projectUser = await ProjectUser.findOne({
        where: {
          user_id: requesterUserId,
          project_id: targetProjectId,
        },
      });
  
      if (!projectUser) {
        return res.status(403).json({ error: 'User does not have permission to view these sprints' });
      }
  
      // Fetch sprints where project_id matches targetProjectId
      const sprints = await Sprint.findAll({
        where: { project_id: targetProjectId },
      });
  
      res.json(sprints);
    } catch (err) {
      res.status(500).json(err);
    }
  };

  const getSprintById = async (req, res) => {
    try {
        const sprintId = req.params.id;
        const requesterUserId = req.user.user_id;

        // Validate that the requesterUserId is provided
        if (!requesterUserId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch the sprint to check if it exists and to get the project_id
        const sprint = await Sprint.findByPk(sprintId);

        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        // Check if the requester is a collaborator on the project associated with the sprint
        const projectUser = await ProjectUser.findOne({
            where: {
                user_id: requesterUserId,
                project_id: sprint.project_id,
            },
        });

        if (!projectUser) {
            return res.status(403).json({ error: 'User does not have permission to view this sprint' });
        }

        // If the user has permission, return the sprint details
        res.json(sprint);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const createSprint = async (req, res) => {
    const { sprint_name, start_date, end_date } = req.body;
    const { projectId } = req.params;
    const requesterUserId = req.user.user_id; // Assuming you have the user_id from the logged-in user

    try {
        // Check if the project exists
        const project = await Project.findByPk(projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the user is a collaborator
        const isCollaborator = await ProjectUser.findOne({
            where: {
                project_id: projectId,
                user_id: requesterUserId
            }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to create a sprint for this project' });
        }

        // Create the sprint
        const sprint = await Sprint.create({
            sprint_name,
            project_id: projectId,
            start_date,
            end_date
        });

        res.status(201).json(sprint);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


const updateSprint = async (req, res) => {
    try {
        const requesterUserId = req.user.user_id;
        const sprintId = req.params.id;
        const { sprint_name, start_date, end_date } = req.body;

        // Validate that the requesterUserId is provided
        if (!requesterUserId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch the sprint to check if it exists and to get the project_id
        const sprint = await Sprint.findByPk(sprintId);
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        // Fetch the associated project to check permissions
        const project = await Project.findByPk(sprint.project_id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the requester is a collaborator
        const isCollaborator = await ProjectUser.findOne({
            where: {
                user_id: requesterUserId,
                project_id: sprint.project_id
            }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'User does not have permission to update this sprint' });
        }

        const updateSprint = await Sprint.findOne({
            where: { sprint_id: sprintId }
        });

        if (updateSprint) {
            await updateSprint.update({
                sprint_name,
                start_date,
                end_date
            });

        if (updateSprint) {
            res.json(updateSprint);
        } else {
            res.status(404).json({ message: 'Sprint not found' });
        }}
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}


const deleteSprint = async (req, res) => {
    try {
        const requesterUserId = req.user.user_id; // User ID from authentication
        const sprintId = req.params.id;

        // Validate that the requesterUserId is provided
        if (!requesterUserId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch the sprint to check if it exists and to get the project_id
        const sprint = await Sprint.findByPk(sprintId);
        if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
        }

        // Fetch the associated project to check permissions
        const project = await Project.findByPk(sprint.project_id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the requester is a collaborator on the project
        const isCollaborator = await ProjectUser.findOne({
            where: {
                user_id: requesterUserId,
                project_id: sprint.project_id
            }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'User does not have permission to delete this sprint' });
        }

        // Delete the sprint
        const deleted = await Sprint.destroy({
            where: { sprint_id: sprintId }
        });

        if (deleted) {
            res.json({ message: 'Sprint deleted' });
        } else {
            res.status(404).json({ message: 'Sprint not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getSprints , getSprintById, createSprint, updateSprint, deleteSprint };