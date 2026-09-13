import { create } from 'zustand';
import { axiosInstance } from '../services/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      set({ authUser: res.data });
      toast.success('Logged in successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/google', data);
      set({ authUser: res.data });
      toast.success('Logged in with Google successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong with Google Login');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log('Error in update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || (socket && socket.connected)) return;

    const baseURL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://real-time-chat-app-1-vxdf.onrender.com');

    const newSocket = io(baseURL, {
      query: {
        userId: authUser._id,
      },
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
