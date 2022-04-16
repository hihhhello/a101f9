import React from 'react';
import { Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:hover': {
      cursor: 'grab',
    },
    paddingInline: 17,
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const Chat = ({
  conversation,
  setActiveChat,
  currentUserId,
  readConversationMessages,
}) => {
  const classes = useStyles();
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    await setActiveChat({
      username: conversation.otherUser.username,
      conversationId: conversation.id,
    });

    if (conversation.id) {
      readConversationMessages(conversation.id, conversation.otherUser.id);
    }
  };

  const hasUnreadMessages = Boolean(conversation.unreadMessages);

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <Box className={classes.leftContainer}>
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          sidebar={true}
        />
        <ChatContent
          conversation={conversation}
          hasUnreadMessages={hasUnreadMessages}
        />
      </Box>
      {hasUnreadMessages && (
        <Badge badgeContent={conversation.unreadMessages} color="primary" />
      )}
    </Box>
  );
};

export default Chat;
