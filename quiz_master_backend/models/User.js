const {DataTypes} = require("sequelize");
const sequelize = require('../configure/db');


const User = sequelize.define('User', {
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    fullname: {type: DataTypes.STRING},
    role: {type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user'} 
});

User.sync({force: true});

module.exports = User;