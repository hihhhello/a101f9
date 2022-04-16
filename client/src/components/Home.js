import React, { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Grid, CssBaseline, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SidebarContainer } from '../components/Sidebar';
import { ActiveChat } from '../components/ActiveChat';
import { SocketContext } from '../context/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post('/api/messages', body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit('new-message', {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);
      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message) => {
      setConversations((prev) => {
        let convInd = null;
        const newState = prev.map((convo, i) => {
          if (convo.otherUser.id === recipientId) {
            convInd = i;
            return {
              ...convo,
              messages: [...convo.messages, message],
              latestMessageText: message.text,
              id: message.conversationId,
            };
          }

          return convo;
        });

        if (convInd === null || convInd === 0) {
          return newState;
        }

        // Moving conv to top with new message
        return [
          newState[convInd],
          ...newState.slice(0, convInd),
          ...newState.slice(convInd + 1),
        ];
      });

      setActiveConversation((prev) => ({
        ...prev,
        conversationId: message.conversationId,
      }));
    },
    [setConversations]
  );

  const addMessageToConversation = useCallback((data) => {
    // if sender isn't null, that means the message needs to be put in a brand new convo
    const { message, sender = null } = data;
    if (sender !== null) {
      const newConvo = {
        id: message.conversationId,
        otherUser: sender,
        messages: [message],
      };
      newConvo.latestMessageText = message.text;
      setConversations((prev) => [newConvo, ...prev]);
      return;
    }

    setConversations((prev) => {
      let convInd = null;
      const newState = prev.map((convo, i) => {
        if (convo.id === message.conversationId) {
          convInd = i;
          return {
            ...convo,
            messages: [...convo.messages, message],
            latestMessageText: message.text,
          };
        }
        return convo;
      });

      if (convInd === null || convInd === 0) {
        return newState;
      }
      // Moving conv to top with new message
      return [
        newState[convInd],
        ...newState.slice(0, convInd),
        ...newState.slice(convInd + 1),
      ];
    });
  }, []);

  const setActiveChat = (username) => {
    setActiveConversation(username);
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const updateConversationMessages = useCallback(
    (data) => {
      const { conversationId, messages, otherUserId } = data;

      if (user.id === otherUserId) {
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages,
                latestMessageText: messages[messages.length - 1].text,
              };
            }
            return conv;
          });
        });
      }
    },
    [user.id]
  );

  const readConversationMessages = useCallback(
    async (convId, otherUserId) => {
      // reading conv and getting updated messages
      const { data } = await axios.patch(`/api/conversations/read/${convId}`);
      // updating messages in our conv
      updateConversationMessages({
        conversationId: convId,
        messages: data.messages,
        otherUserId: user.id,
      });
      // updating messages in other user conv
      socket.emit('read-conv-messages', {
        conversationId: convId,
        messages: data.messages,
        otherUserId: otherUserId,
      });
    },
    [socket, updateConversationMessages, user.id]
  );

  const retreiveNewMessage = useCallback(
    async (data) => {
      const { message, recipientId } = data;
      if (recipientId === user.id) {
        const conv = conversations.find((c) => c.id === message.conversationId);
        const isActiveConv =
          Boolean(activeConversation) &&
          Boolean(conv) &&
          conv.otherUser.username === activeConversation.username;

        // If we started a new conversation - we don't have it's ID before we get an answer on our message
        // Thus we need to check if user (that created conv) is in this conv, so he could immediately read it, by comparing usernames
        if (conv) {
          if (
            activeConversation &&
            !activeConversation.conversationId &&
            activeConversation.username === conv.otherUser.username
          ) {
            setActiveConversation((prev) => ({
              ...prev,
              conversationId: message.conversationId,
            }));
          }
        }

        // Reading received message if convId is active
        if (isActiveConv) {
          readConversationMessages(conv.id, conv.otherUser.id);
        } else {
          addMessageToConversation(data);
        }
      }
    },
    [
      activeConversation,
      addMessageToConversation,
      conversations,
      readConversationMessages,
      user.id,
    ]
  );

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on('add-online-user', addOnlineUser);
    socket.on('remove-offline-user', removeOfflineUser);
    socket.on('new-message', retreiveNewMessage);
    socket.on('read-conv-messages', updateConversationMessages);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', retreiveNewMessage);
      socket.off('read-conv-messages', updateConversationMessages);
    };
  }, [
    addOnlineUser,
    retreiveNewMessage,
    removeOfflineUser,
    socket,
    updateConversationMessages,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push('/login');
      else history.push('/register');
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/conversations');
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          readConversationMessages={readConversationMessages}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
