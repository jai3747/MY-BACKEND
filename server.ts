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

// // Enhanced CORS Configuration with all service IPs
// const allowedOrigins = [
//   'http://34.93.14.21',
//   'http://34.93.14.21:80',
//   'http://34.100.172.207:5000',
//   'http://localhost:3000',
//   'http://localhost:8080',
//   'http://jc.awsaparna123.xyz',
//   'http://jc1.awsaparna123.xyz'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(null, true); // Allow all origins in production
//     }
//   },
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 204
// }));

// app.use(express.json());

// // MongoDB Connection with retry logic
// const connectDB = async (): Promise<void> => {
//   const maxRetries = 5;
//   let retries = 0;

//   while (retries < maxRetries) {
//     try {
//       const mongoUri = process.env.MONGO_URI;
//       if (!mongoUri) {
//         throw new Error('MongoDB URI is not defined');
//       }
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
// }, {
//   timestamps: true
// });

// const User = mongoose.model<IUserDocument>('User', UserSchema);

// // Routes
// app.get('/', (req: Request, res: Response) => {
//   res.send('Backend Server is Running');
// });

// app.get('/api/health', (req: Request, res: Response) => {
//   res.status(200).json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV
//   });
// });

// app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const users = await User.find().select('-__v').sort({ createdAt: -1 });
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
//     const user = await User.create(req.body);
//     res.status(201).json({
//       success: true,
//       data: user
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

// // Error handling middleware
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// // Initialize database connection
// connectDB();

// const PORT: number = parseInt(process.env.PORT || '5000', 10);
// const HOST: string = '0.0.0.0';

// app.listen(PORT, HOST, () => {
//   console.log(`Server running on http://${HOST}:${PORT}`);
// });

// export default app;
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Types
interface IUser {
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserDocument extends IUser, Document {}

interface ErrorWithStatus extends Error {
  status?: number;
  code?: number;
}

// Express app initialization
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Enhanced CORS Configuration
const allowedOrigins = [
  'http://34.93.14.21',
  'http://34.93.14.21:80',
  'http://34.100.172.207:5000',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://jc.awsaparna123.xyz',
  'http://jc1.awsaparna123.xyz'
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, we'll allow all origins but log unexpected ones
      console.warn(`Unexpected origin: ${origin}`);
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// MongoDB Connection with enhanced retry logic and proper typing
const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MongoDB URI is not defined');
      }

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

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

// Enhanced User Schema with proper validation
const UserSchema = new Schema<IUserDocument>({
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

// Add index for email field
UserSchema.index({ email: 1 });

const User = mongoose.model<IUserDocument>('User', UserSchema);

// Middleware to validate MongoDB ObjectId
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

// Routes with proper typing and validation
app.get('/', (_req: Request, res: Response) => {
  res.send('Backend Server is Running');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

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

    // Input validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and email'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({ name, email });
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
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

// Enhanced error handling middleware with proper typing
app.use((err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize database connection
connectDB().catch(console.error);

const PORT: number = parseInt(process.env.PORT || '5000', 10);
const HOST: string = '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
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

export default app;
