import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../services/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // After getting messages, mark them as read if they were sent by the other user
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      // Update local messages state
      const { messages } = get();
      const updatedMessages = messages.map(msg => 
        msg.senderId === userId && !msg.read ? { ...msg, read: true } : msg
      );
      set({ messages: updatedMessages });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending message');
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off('newMessage');
    socket.off('messagesRead');
    socket.off('messagesDelivered');

    socket.on('newMessage', (newMessage) => {
      const { selectedUser, messages, users } = get();
      const authUser = useAuthStore.getState().authUser;

      if (selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
        const isDuplicate = messages.some(m => m._id === newMessage._id);
        if (!isDuplicate) {
          set({ messages: [...messages, newMessage] });
        }
        if (newMessage.senderId === selectedUser._id) {
          get().markMessagesAsRead(selectedUser._id);
        }
      } else {
        const updatedUsers = users.map(user => {
          if (user._id === newMessage.senderId) {
            return { ...user, unreadCount: (user.unreadCount || 0) + 1 };
          }
          return user;
        });
        set({ users: updatedUsers });
      }
    });

    socket.on('messagesRead', ({ receiverId }) => {
      const { messages } = get();
      const authUser = useAuthStore.getState().authUser;
      const updatedMessages = messages.map(msg => {
        if ((msg.receiverId === receiverId || msg.senderId === authUser?._id) && !msg.read) {
          return { ...msg, read: true, delivered: true };
        }
        return msg;
      });
      set({ messages: updatedMessages });
    });

    socket.on('messagesDelivered', ({ receiverId }) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => {
        if (msg.receiverId === receiverId && !msg.delivered) {
          return { ...msg, delivered: true };
        }
        return msg;
      });
      set({ messages: updatedMessages });
    });
  },

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off('userTyping');
    socket.off('userStoppedTyping');

    socket.on('userTyping', ({ senderId }) => {
      set(state => ({ typingUsers: [...new Set([...state.typingUsers, senderId])] }));
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      set(state => ({ typingUsers: state.typingUsers.filter(id => id !== senderId) }));
    });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off('userTyping');
    socket.off('userStoppedTyping');
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off('newMessage');
    socket.off('messagesRead');
    socket.off('messagesDelivered');
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      const { users } = get();
      const updatedUsers = users.map(u => u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u);
      set({ users: updatedUsers });
      get().subscribeToMessages();
    }
  },
}));
