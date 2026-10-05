import User from '../models/User.model.js';
import Message from '../models/Message.model.js';
import cloudinary from '../config/cloudinary.js';
import { getIO, getReceiverSocketId } from '../sockets/socket.js';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password').lean();
    
    // Get unread counts for each user
    const usersWithUnreadCounts = await Promise.all(users.map(async (user) => {
      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUserId,
        read: false
      });
      return { ...user, unreadCount };
    }));

    res.status(200).json(usersWithUnreadCounts);
  } catch (error) {
    console.log('Error in getUsersForSidebar: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: 'video' });
      audioUrl = uploadResponse.secure_url;
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    const isReceiverOnline = !!receiverSocketId;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      delivered: isReceiverOnline,
    });

    await newMessage.save();

    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId: myId, read: false },
      { $set: { read: true, delivered: true } }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      const io = getIO();
      io.to(senderSocketId).emit('messagesRead', { receiverId: myId });
    }

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.log('Error in markMessagesAsRead: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
