module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      task_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sprint_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      effort: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      creator_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      task_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'Tasks',
      timestamps: false,
    });
  
    return Task;
  };
  