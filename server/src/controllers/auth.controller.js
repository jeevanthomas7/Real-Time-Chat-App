import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import cloudinary from '../config/cloudinary.js';
import { z } from 'zod';

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { username, email, password } = validatedData;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.log('Error in signup controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (!user.password) {
      return res.status(400).json({ message: 'User registered with Google. Please use Google Login.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.log('Error in login controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, username, googleId, profilePic } = req.body;
    
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID are required.' });
    }

    // Ensure username is valid string with minimum length of 3 characters for Mongoose validation
    let safeUsername = username ? username.trim() : '';
    if (!safeUsername || safeUsername.length < 3) {
      const emailPrefix = email.split('@')[0];
      safeUsername = emailPrefix.length >= 3 ? emailPrefix : `${emailPrefix}_user`;
    }
    
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    
    if (user) {
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isUpdated = true;
      }
      if (!user.profilePic && profilePic) {
        user.profilePic = profilePic;
        isUpdated = true;
      }
      if (isUpdated) {
        await user.save();
      }
    } else {
      user = new User({
        username: safeUsername,
        email,
        googleId,
        profilePic: profilePic || '',
      });
      await user.save();
    }
    
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log('Error in google auth controller:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { 
      maxAge: 0,
      sameSite: 'none',
      secure: true,
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.log('Error in logout controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: 'Profile pic is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Error in updateProfile controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log('Error in checkAuth controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
