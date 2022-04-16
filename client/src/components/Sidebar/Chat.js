import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { BadgeAvatar, ChatContent } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';

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
  rightContainer: {
    backgroundColor: '#3F92FF',
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2px 7px',
    minWidth: 15,
    minHeightt: 15,
  },
  unreadCount: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
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

  const unreadMessages = conversation.messages.filter(
    (msg) => msg.senderId !== currentUserId && !msg.isRead
  );

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <Box className={classes.leftContainer}>
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          sidebar={true}
        />
        <ChatContent conversation={conversation} />
      </Box>
      {Boolean(unreadMessages.length) && (
        <Box className={classes.rightContainer}>
          <Typography className={classes.unreadCount}>
            {unreadMessages.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Chat;
