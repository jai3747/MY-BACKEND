// // require('dotenv').config();
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');

// // const app = express();

// // // Enhanced CORS Configuration
// // app.use(cors({
// //   origin: [
// //     'http://localhost:3000', 
// //     'http://frontend-service', 
// //     'http://34.93.14.21:80', 
// //     'http://34.93.14.21', 
// //     'http://34.100.172.207:80',
// //     'http://34.100.172.207',
// //     '*'
// //   ],
// //   methods: ['GET', 'POST', 'DELETE'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));

// // app.use(express.json());

// // // Improved MongoDB Connection with robust error handling
// // mongoose.connect(process.env.MONGO_URI, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // })
// // .then(() => console.log('MongoDB connected successfully'))
// // .catch(err => {
// //   console.error('MongoDB connection error:', err);
// //   process.exit(1);
// // });

// // // User Schema with enhanced validation
// // const UserSchema = new mongoose.Schema({
// //   name: { 
// //     type: String, 
// //     required: [true, 'Name is required'],
// //     trim: true,
// //     minlength: [2, 'Name must be at least 2 characters']
// //   },
// //   email: { 
// //     type: String, 
// //     required: [true, 'Email is required'], 
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// //   }
// // });

// // const User = mongoose.model('User', UserSchema);

// // // Centralized error handling middleware
// // const errorHandler = (err, req, res, next) => {
// //   console.error(err);
  
// //   // Handle specific Mongoose validation errors
// //   if (err.name === 'ValidationError') {
// //     const messages = Object.values(err.errors).map(error => error.message);
// //     return res.status(400).json({
// //       success: false,
// //       message: messages.join(', ')
// //     });
// //   }

// //   // Handle duplicate key error
// //   if (err.code === 11000) {
// //     return res.status(400).json({
// //       success: false,
// //       message: 'Email already exists'
// //     });
// //   }

// //   res.status(err.status || 500).json({
// //     success: false,
// //     message: err.message || 'Internal Server Error'
// //   });
// // };

// // // Routes with improved error handling
// // app.get('/', (req, res) => {
// //   res.send('Backend Server is Running');
// // });

// // app.get('/api/health', (req, res) => {
// //   res.status(200).json({ 
// //     status: 'healthy',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // app.get('/api/users', async (req, res, next) => {
// //   try {
// //     const users = await User.find().select('-__v');
// //     res.json({ 
// //       success: true, 
// //       count: users.length,
// //       data: users 
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // app.post('/api/users', async (req, res, next) => {
// //   try {
// //     const { name, email } = req.body;
// //     const newUser = new User({ name, email });
// //     await newUser.save();
// //     res.status(201).json({ 
// //       success: true, 
// //       data: newUser 
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // app.delete('/api/users/:id', async (req, res, next) => {
// //   try {
// //     const user = await User.findByIdAndDelete(req.params.id);
// //     if (!user) {
// //       return res.status(404).json({ 
// //         success: false, 
// //         message: 'User not found' 
// //       });
// //     }
// //     res.json({ 
// //       success: true, 
// //       data: user 
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // // Apply error handling middleware
// // app.use(errorHandler);

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, '0.0.0.0', () => {
// //   console.log(`Server running on port ${PORT}`);
// // });
// // src/server.ts
// import dotenv from 'dotenv';
// import express, { Request, Response, NextFunction } from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';

// dotenv.config();

// const app = express();

// // Types
// interface IUser {
//   name: string;
//   email: string;
// }

// interface IUserDocument extends IUser, mongoose.Document {}

// // Enhanced CORS Configuration
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://frontend-service',
//     'http://34.93.14.21:80',
//     'http://34.93.14.21',
//     'http://34.100.172.207:80',
//     'http://34.100.172.207',
//     '*'
//   ],
//   methods: ['GET', 'POST', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// // MongoDB Connection
// const connectDB = async (): Promise<void> => {
//   try {
//     const mongoUri = process.env.MONGO_URI;
//     if (!mongoUri) {
//       throw new Error('MongoDB URI is not defined in environment variables');
//     }
//     await mongoose.connect(mongoUri);
//     console.log('MongoDB connected successfully');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };

// connectDB();

// // User Schema
// const UserSchema = new mongoose.Schema<IUserDocument>({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     minlength: [2, 'Name must be at least 2 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   }
// });

// const User = mongoose.model<IUserDocument>('User', UserSchema);

// // Error Handler Interface
// interface ErrorResponse extends Error {
//   status?: number;
//   code?: number;
// }

// // Error Handler Middleware
// const errorHandler = (
//   err: ErrorResponse,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   console.error(err);

//   if (err.name === 'ValidationError' && err instanceof mongoose.Error.ValidationError) {
//     const messages = Object.values(err.errors).map(error => error.message);
//     res.status(400).json({
//       success: false,
//       message: messages.join(', ')
//     });
//     return;
//   }

//   if (err.code === 11000) {
//     res.status(400).json({
//       success: false,
//       message: 'Email already exists'
//     });
//     return;
//   }

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// };

// // Routes
// app.get('/', (req: Request, res: Response) => {
//   res.send('Backend Server is Running');
// });

// app.get('/api/health', (req: Request, res: Response) => {
//   res.status(200).json({
//     status: 'healthy',
//     timestamp: new Date().toISOString()
//   });
// });

// app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const users = await User.find().select('-__v');
//     res.json({
//       success: true,
//       count: users.length,
//       data: users
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { name, email } = req.body;
//     const newUser = new User({ name, email });
//     await newUser.save();
//     res.status(201).json({
//       success: true,
//       data: newUser
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// app.delete('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
//     res.json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // Apply error handling middleware
// app.use(errorHandler);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });
// server.ts
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();

// Types
interface IUser {
  name: string;
  email: string;
}

interface IUserDocument extends IUser, mongoose.Document {}

// Enhanced CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://frontend-service',
    'http://34.93.14.21:80',
    'http://34.93.14.21',
    'http://34.100.172.207:80',
    'http://34.100.172.207',
    '*'
  ],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// User Schema
const UserSchema = new mongoose.Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  }
});

const User = mongoose.model<IUserDocument>('User', UserSchema);

// Error Handler Interface
interface ErrorResponse extends Error {
  status?: number;
  code?: number;
}

// Error Handler Middleware
const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  if (err.name === 'ValidationError' && err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(error => error.message);
    res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
    return;
  }

  if (err.code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Backend Server is Running');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
