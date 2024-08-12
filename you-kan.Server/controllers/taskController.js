const { Task, Sprint, User, ProjectUser } = require('../models');
const { Sequelize } = require('sequelize');

const getTasks = async (req, res) => {
    const { project_id, user_id, sprint_id, status, priority, sort } = req.query;
    const requesterUserId = req.user.user_id;;

    // Use the user_id from the query if provided, otherwise use the requesterUserId
    const userId = user_id || requesterUserId;

    // Validate project_id and user_id
    if (!userId) {
        return res.status(400).json({ error: 'User ID must be specified in the query parameters.' });
    }

    if (!project_id) {
        return res.status(400).json({ error: 'Project ID must be specified.' });
    }

    try {
        // Check if the requesterUserId is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to access tasks in this project.' });
        }

        // Build the query options
       // const include = [{ model: User, where: { user_id: userId } }];
        const where = { project_id }; // Ensure that tasks are filtered by the project

        if (sprint_id) where.sprint_id = sprint_id;
        if (status) where.status = status;
        if (priority) where.priority = priority;

        const order = [];
        if (sort) {
            order.push(sort.split(':')); // Assumes only 1 sort query param for now
        }

        const queryOptions = { where, order };

        // Fetch the tasks
        const tasks = await Task.findAll(queryOptions);

        if (tasks.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const getTaskById = async (req, res) => {
    let task;
    try {
        task = await Task.findByPk(req.params.id);
    } catch {
        return res.sendStatus(500);
    }

    if (!task) {
        return res.sendStatus(404);
    } else {
        return res.status(200).json(task);
    }
}

const createTask = async (req, res) => {
    const taskBody = { ...req.body, created_at: new Date().toISOString() };
    const requesterUserId = req.user.user_id;

    if (taskBody.sprint_id === undefined) {
        taskBody.sprint_id = null; // Set sprint_id to null if not provided
    }

    //set the creator id to the user id of the requester
    taskBody.creator_user_id = requesterUserId; 

    try {
        // Check if the user is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id: taskBody.project_id }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to create tasks in this project.' });
        }

        // Create the task
        const newTask = await Task.create(taskBody);

        return res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};


const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.user_id;

    try {
        // Fetch the task to get the associated project ID
        const task = await Task.findOne({ where: { task_id: taskId } });
        if (!task) {
            return res.sendStatus(404);
        }

        // Check if the user is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: {
                user_id: userId,
                project_id: task.project_id,
            },
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: "You don't have permission to delete this task." });
        }

        // Delete the task
        const rowsDeleted = await Task.destroy({ where: { task_id: taskId } });

        if (rowsDeleted === 0) {
            return res.sendStatus(404);
        } else {
            return res.sendStatus(204);
        }
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
};


const updateTask = async (req, res) => {
    const  task_id  = req.params.id;
    const taskBody = req.body;
    const requesterUserId = req.user.user_id;

    try {
        // Fetch the task to check the project_id
        const task = await Task.findByPk(task_id);
        console.log(`Looking for task with ID: ${task_id}`);

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Check if the user is in the project
        const isCollaborator = await ProjectUser.findOne({
            where: {
                project_id: task.project_id,
                user_id: requesterUserId
            }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'User is not part of the project.' });
        }

        // If sprint_id is provided, check if it belongs to the same project
        if (taskBody.sprint_id !== undefined && taskBody.sprint_id !== null) {
            const sprint = await Sprint.findByPk(taskBody.sprint_id);

            if (!sprint) {
                return res.status(400).json({ error: 'Sprint not found.' });
            }

            if (sprint.project_id !== task.project_id) {
                return res.status(400).json({ error: 'Sprint does not belong to the same project as the task.' });
            }
        }

        // Update the task
        const [rowsUpdated] = await Task.update(taskBody, {
            where: { task_id },
        });

        if (rowsUpdated === 0) {
            return res.status(404).json({ error: 'Task not found or no changes made.' });
        }

        const updatedTask = await Task.findByPk(task_id);
        return res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error.' });
    }
};

module.exports = { getTasks, getTaskById, createTask, deleteTask, updateTask }