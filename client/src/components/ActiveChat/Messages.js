import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  return (
    <Box>
      {messages.map((message, i) => {
        const time = moment(message.createdAt).format('h:mm');
        const isLastMsg = i === messages.length - 1;

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            isRead={message.isRead}
            time={time}
            otherUser={otherUser}
            isLastMsg={isLastMsg}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
