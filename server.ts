
// // import dotenv from 'dotenv';
// // import express, { Request, Response, NextFunction } from 'express';
// // import mongoose from 'mongoose';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import rateLimit from 'express-rate-limit';

// // dotenv.config();

// // interface IUser {
// //   name: string;
// //   email: string;
// //   createdAt?: Date;
// //   updatedAt?: Date;
// // }

// // interface IErrorWithCode extends Error {
// //   code?: number;
// // }

// // const app = express();

// // // Security middleware
// // app.use(helmet({
// //   contentSecurityPolicy: false,
// //   crossOriginEmbedderPolicy: false,
// //   crossOriginResourcePolicy: { policy: "cross-origin" }
// // }));

// // // Basic middleware
// // app.use(express.json({ limit: '10kb' }));

// // // CORS configuration
// // const corsOptions: cors.CorsOptions = {
// //   origin: process.env.NODE_ENV === 'production'
// //     ? ['https://awsaparna123.xyz', 'https://api.awsaparna123.xyz', 'http://localhost:3000']
// //     : true,
// //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// //   credentials: true,
// //   optionsSuccessStatus: 200
// // };

// // app.use(cors(corsOptions));

// // // Health check endpoint - matches Kubernetes probe
// // app.get('/api', (_req: Request, res: Response) => {
// //   res.status(200).json({
// //     status: 'healthy',
// //     timestamp: new Date().toISOString(),
// //     environment: process.env.NODE_ENV
// //   });
// // });

// // // Rate limiting
// // const apiLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 100,
// //   message: 'Too many requests from this IP, please try again later'
// // });

// // app.use('/api/users', apiLimiter);

// // // MongoDB Connection
// // const connectDB = async (): Promise<void> => {
// //   const maxRetries = 5;
// //   let retries = 0;

// //   while (retries < maxRetries) {
// //     try {
// //       const mongoUri = process.env.MONGO_URI;
// //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// //       await mongoose.connect(mongoUri);
// //       console.log('MongoDB connected successfully');
// //       return;
// //     } catch (err) {
// //       retries++;
// //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// //       if (retries === maxRetries) {
// //         console.error('Max retries reached. Exiting...');
// //         process.exit(1);
// //       }
      
// //       await new Promise(resolve => setTimeout(resolve, 5000));
// //     }
// //   }
// // };

// // // User Schema
// // const UserSchema = new mongoose.Schema<IUser>({
// //   name: {
// //     type: String,
// //     required: [true, 'Name is required'],
// //     trim: true,
// //     minlength: [2, 'Name must be at least 2 characters'],
// //     maxlength: [50, 'Name cannot be more than 50 characters']
// //   },
// //   email: {
// //     type: String,
// //     required: [true, 'Email is required'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// //   }
// // }, {
// //   timestamps: true
// // });

// // const User = mongoose.model<IUser>('User', UserSchema);

// // // Middleware for ID validation
// // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// //     res.status(400).json({ 
// //       success: false, 
// //       message: 'Invalid ID format' 
// //     });
// //     return;
// //   }
// //   next();
// // };

// // // Routes
// // app.get('/api/users', async (_req: Request, res: Response) => {
// //   try {
// //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// //     res.json({ 
// //       success: true, 
// //       count: users.length, 
// //       data: users 
// //     });
// //   } catch (error) {
// //     const err = error as Error;
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Error fetching users',
// //       error: err.message 
// //     });
// //   }
// // });

// // app.post('/api/users', async (req: Request, res: Response) => {
// //   try {
// //     const { name, email } = req.body;
// //     const user = await User.create({ name, email });
// //     res.status(201).json({ 
// //       success: true, 
// //       data: user 
// //     });
// //   } catch (error) {
// //     const err = error as IErrorWithCode;
// //     if (err.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Email already exists'
// //       });
// //     }
// //     res.status(400).json({ 
// //       success: false, 
// //       message: err.message 
// //     });
// //   }
// // });

// // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response) => {
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
// //     const err = error as Error;
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Error deleting user',
// //       error: err.message 
// //     });
// //   }
// // });

// // // Error handling middleware
// // app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
// //   console.error(err.stack);
// //   res.status(500).json({
// //     success: false,
// //     message: 'Internal Server Error'
// //   });
// // });

// // const PORT = process.env.PORT || 5000;
// // const server = app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });

// // // Graceful shutdown
// // process.on('SIGTERM', () => {
// //   console.log('SIGTERM signal received. Closing HTTP server');
// //   server.close(() => {
// //     console.log('HTTP server closed');
// //     mongoose.connection.close(false).then(() => {
// //       console.log('MongoDB connection closed');
// //       process.exit(0);
// //     });
// //   });
// // });

// // connectDB().catch(console.error);

// // export default app;
// import dotenv from 'dotenv';
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

// dotenv.config();

// const app = express();

// // Security middleware with relaxed settings for Kubernetes
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // Basic middleware
// app.use(express.json({ limit: '10kb' }));

// // CORS configuration - Allow all origins in development
// const corsOptions = {
//   origin: '*',  // Allow all origins
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: false  // Disable credentials for cross-namespace communication
// };

// app.use(cors(corsOptions));

// // Health check endpoint
// app.get('/api/health', (_req, res) => {
//   res.status(200).json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV
//   });
// });

// // Rate limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later'
// });

// app.use('/api/users', apiLimiter);

// // MongoDB Connection
// const connectDB = async () => {
//   const maxRetries = 5;
//   let retries = 0;

//   while (retries < maxRetries) {
//     try {
//       // Use MongoDB service DNS name
//       const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/userdb';
//       await mongoose.connect(mongoUri);
//       console.log('MongoDB connected successfully');
//       return;
//     } catch (err) {
//       retries++;
//       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
//       if (retries === maxRetries) {
//         console.error('Max retries reached. Exiting...');
//         process.exit(1);
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 5000));
//     }
//   }
// };

// // User Schema
// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     minlength: [2, 'Name must be at least 2 characters'],
//     maxlength: [50, 'Name cannot be more than 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   }
// }, {
//   timestamps: true
// });

// const User = mongoose.model('User', UserSchema);

// // Middleware for ID validation
// const validateObjectId = (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     res.status(400).json({ 
//       success: false, 
//       message: 'Invalid ID format' 
//     });
//     return;
//   }
//   next();
// };

// // Routes
// app.get('/api/users', async (_req, res) => {
//   try {
//     const users = await User.find().select('-__v').sort({ createdAt: -1 });
//     res.json({ 
//       success: true, 
//       count: users.length, 
//       data: users 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching users',
//       error: error.message 
//     });
//   }
// });

// app.post('/api/users', async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     const user = await User.create({ name, email });
//     res.status(201).json({ 
//       success: true, 
//       data: user 
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }
//     res.status(400).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// });

// app.delete('/api/users/:id', validateObjectId, async (req, res) => {
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
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error deleting user',
//       error: error.message 
//     });
//   }
// });

// // Error handling middleware
// app.use((err, _req, res, _next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received. Closing HTTP server');
//   server.close(() => {
//     console.log('HTTP server closed');
//     mongoose.connection.close(false).then(() => {
//       console.log('MongoDB connection closed');
//       process.exit(0);
//     });
//   });
// });

// connectDB().catch(console.error);

// export default app;
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Security middleware with relaxed settings for Kubernetes
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Basic middleware
app.use(express.json({ limit: '10kb' }));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || '*',  // Allow configured origin or all origins
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false  // Disable credentials for cross-namespace communication
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/users', apiLimiter);

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/userdb';
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// User Interface
interface IUser {
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User Schema
const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', UserSchema);

// Middleware for ID validation
const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid ID format' 
    });
    return;
  }
  next();
};

// Routes
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: users.length, 
      data: users 
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching users',
        error: error.message 
      });
    }
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    if (error instanceof Error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
});

app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response) => {
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
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting user',
        error: error.message 
      });
    }
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

connectDB().catch(console.error);

export default app;
