const Sequelize = require("sequelize");
const db = require("../db");

const Group = db.define("group", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  imgSrc: {
    type: Sequelize.STRING,
    allowNull: true
  },
  roomUid: {
    type: Sequelize.STRING,
    defaultValue: Sequelize.UUIDV4
  }
});

module.exports = Group;
