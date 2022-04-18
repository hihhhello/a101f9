const db = require("../db");

const Conversation = db.define("conversation", {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  roomUid: {
    type: Sequelize.STRING,
    defaultValue: Sequelize.UUIDV4
  }
});

module.exports = Conversation;
