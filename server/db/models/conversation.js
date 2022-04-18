const db = require("../db");

const Conversation = db.define("conversation", {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Conversation;
