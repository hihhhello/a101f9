const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const UserConversation = require("./user-conversation");

// associations
Message.belongsTo(UserConversation);
UserConversation.hasMany(Message);
User.belongsToMany(Conversation, { through: UserConversation });
Conversation.belongsToMany(User, { through: UserConversation });

module.exports = {
  User,
  Conversation,
  Message,
  UserConversation
};
