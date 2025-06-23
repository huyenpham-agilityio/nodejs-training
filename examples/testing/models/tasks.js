module.exports = (sequelize, DataTypes) => {
  const Tasks = sequelize.define("tasks", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });
  Tasks.associate = (models) => {
    Tasks.belongsTo(models.users);
  };

  return Tasks;
};
