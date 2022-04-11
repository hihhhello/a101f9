const Sequelize = require("sequelize");
const db = require("../db");

const UserGroup = db.define("user_group", {
  role: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

module.exports = UserGroup;
