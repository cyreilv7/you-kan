/*
    Instantiates models and exports for use by controllers
    Also defines relationships between models
*/

const sequelize = require('../db/db-connector');
const { DataTypes } = require('sequelize');

const User = require('./User.model')(sequelize, DataTypes);
const Project = require('./Project.model')(sequelize, DataTypes);
const Sprint = require('./Sprint.model')(sequelize, DataTypes)
const Task = require('./Task.model')(sequelize, DataTypes);
const Subtask = require('./Subtask.model')(sequelize, DataTypes);
const Comment = require('./Comment.model')(sequelize, DataTypes);
const Task_Assignee = require('./Task_Assignee.model')(sequelize, DataTypes);
const ProjectUser = require('./ProjectUser.model')(sequelize, DataTypes);

// One to many relationships
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(Comment, { foreignKey: 'task_id' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });

Task.hasMany(Subtask, { foreignKey: 'task_id' });
Subtask.belongsTo(Task, { foreignKey: 'task_id' });

Sprint.hasMany(Task, { foreignKey: 'sprint_id' });
Task.belongsTo(Sprint, { foreignKey: 'sprint_id' });

Sprint.belongsTo(Project, { foreignKey: 'project_id' });
Sprint.hasMany(Task, { foreignKey: 'sprint_id' });

Project.belongsTo(User, { foreignKey: 'creator_user_id' });

Project.hasMany(Task, { foreignKey: 'project_id' })
Task.belongsTo(Project, { foreignKey: 'project_id' });

// Many to many relationships
User.belongsToMany(Task, { through: Task_Assignee, foreignKey: 'user_id', otherKey: 'task_id' });
Task.belongsToMany(User, { through: Task_Assignee, foreignKey: 'task_id', otherKey: 'user_id' });


User.belongsToMany(Project, { through: ProjectUser, foreignKey: 'user_id', otherKey: 'project_id'});
Project.belongsToMany(User, { through: ProjectUser, foreignKey: 'project_id', otherKey: 'user_id'});

module.exports = { User, Project, Sprint, Task, Task_Assignee, Subtask, Comment, ProjectUser };
