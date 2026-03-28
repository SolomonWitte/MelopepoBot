const { DataTypes } = require('sequelize');
const sequelize = require('./path/to/your/sequelize/instance'); // Export the instance from index.js

const Level = sequelize.define('Level', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    messages: {
        type: DataTypes.INTEGER,
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    }
});

module.exports = Level; 