const { Comment, Task, ProjectUser } = require('../models');

const getComments = async (req, res) => {

    const { task_id } = req.query;
    const requesterUserId = req.user.user_id;;

    if (!task_id) {
        return res.status(400).json({ error: 'Task ID must be specified in the query parameters.' });
    }

    try {
        // Retrieve the project_id associated with the task
        const task = await Task.findOne({ where: { task_id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const projectId = task.project_id;

        // Check if the requesterUserId is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id: projectId }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to view comments for this task.' });
        }

        // Fetch comments if the user is a collaborator
        const comments = await Comment.findAll({ where: { task_id } });

        if (comments.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(comments);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const getCommentById = async (req, res) => {
    let comment;
    try {
        comment = await Comment.findByPk(req.params.id);
    } catch {
        return res.sendStatus(500);
    }

    if (!comment) {
        return res.sendStatus(404);
    }
    return res.status(200).json(comment);
}

const createComment = async (req, res) => {
    const { task_id, comment_text } = req.body;
    const requesterUserId = req.user.user_id;

    if (!task_id || !comment_text) {
        return res.status(400).json({ error: 'Task ID and comment text must be provided.' });
    }

    try {
        // Retrieve the project_id associated with the task
        const task = await Task.findOne({ where: { task_id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const projectId = task.project_id;

        // Check if the requesterUserId is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id: projectId }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to create comments for this task.' });
        }

        // Proceed with creating the comment
        const commentBody = { ...req.body, created_at: new Date().toISOString(), user_id: requesterUserId };
        const newComment = await Comment.create(commentBody);

        return res.status(201).json(newComment);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const requesterUserId = req.user.user_id;

    let comment;
    try {
        // Retrieve the comment to delete
        comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Retrieve the task associated with the comment to get project_id
        const task = await Task.findOne({ where: { task_id: comment.task_id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const projectId = task.project_id;

        //Check if the requesterUserId is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id: projectId }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to delete comments in this project.' });
        }

        // Check if the requesterUserId is the owner of the comment or has permission to delete
        if (comment.user_id !== requesterUserId) {
            return res.status(403).json({ error: 'You do not have permission to delete this comment.' });
        }

        let rowsDeleted;
        try {
            rowsDeleted = await Comment.destroy({ where: { comment_id: commentId } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Server error' });
        }

        if (rowsDeleted === 0) {
            return res.status(404).json({ error: 'No comment found to delete.' });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const updateComment = async (req, res) => {
    const comment_id = req.params.id;
    const commentBody = req.body;
    const requesterUserId = req.user.user_id;

    let comment;
    try {
        // Retrieve the comment to update
        comment = await Comment.findByPk(comment_id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        // Retrieve the task associated with the comment to get project_id
        const task = await Task.findOne({ where: { task_id: comment.task_id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const projectId = task.project_id;

        // Check if the requesterUserId is part of the project
        const isCollaborator = await ProjectUser.findOne({
            where: { user_id: requesterUserId, project_id: projectId }
        });

        if (!isCollaborator) {
            return res.status(403).json({ error: 'You do not have permission to update comments in this project.' });
        }

        // Check if the requesterUserId is the owner of the comment or has permission to update
        if (comment.user_id !== requesterUserId) {
            return res.status(403).json({ error: 'You do not have permission to update this comment.' });
        }

        let updatedComment;
        try {
            updatedComment = await comment.update(commentBody);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Server error' });
        }

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getComments, getCommentById, createComment, deleteComment, updateComment }
