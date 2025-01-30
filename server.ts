// // // // // // // import dotenv from 'dotenv';
// // // // // // // // import express, { Request, Response, NextFunction } from 'express';
// // // // // // // // import mongoose, { Document, Schema } from 'mongoose';
// // // // // // // // import cors from 'cors';
// // // // // // // // import helmet from 'helmet';
// // // // // // // // import rateLimit from 'express-rate-limit';

// // // // // // // // dotenv.config();

// // // // // // // // // Types
// // // // // // // // interface IUser {
// // // // // // // //   name: string;
// // // // // // // //   email: string;
// // // // // // // //   createdAt?: Date;
// // // // // // // //   updatedAt?: Date;
// // // // // // // // }

// // // // // // // // interface IUserDocument extends IUser, Document {}

// // // // // // // // interface ErrorWithStatus extends Error {
// // // // // // // //   status?: number;
// // // // // // // //   code?: number;
// // // // // // // //   errors?: { [key: string]: { message: string } };
// // // // // // // // }

// // // // // // // // // Express app initialization
// // // // // // // // const app = express();

// // // // // // // // // Security middleware
// // // // // // // // app.use(helmet());

// // // // // // // // // Rate limiting
// // // // // // // // const limiter = rateLimit({
// // // // // // // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // // // // // // //   max: 100 // limit each IP to 100 requests per windowMs
// // // // // // // // });
// // // // // // // // app.use('/api/', limiter);

// // // // // // // // // Enhanced CORS Configuration
// // // // // // // // const allowedOrigins = [
// // // // // // // //   'http://34.93.14.21',
// // // // // // // //   'http://34.93.14.21:80',
// // // // // // // //   'http://34.100.172.207:5000',
// // // // // // // //   'http://localhost:3000',
// // // // // // // //   'http://localhost:8080',
// // // // // // // //   'http://jc.awsaparna123.xyz',
// // // // // // // //   'http://jc1.awsaparna123.xyz',
// // // // // // // //   'http://api.awsaparna123.xyz:5000',
// // // // // // // // ].filter(Boolean);

// // // // // // // // const corsOptions: cors.CorsOptions = {
// // // // // // // //   origin: (origin, callback) => {
// // // // // // // //     // Allow requests with no origin (like mobile apps or curl requests)
// // // // // // // //     if (!origin) {
// // // // // // // //       return callback(null, true);
// // // // // // // //     }
// // // // // // // //     if (allowedOrigins.includes(origin)) {
// // // // // // // //       callback(null, true);
// // // // // // // //     } else {
// // // // // // // //       // In production, we'll allow all origins but log unexpected ones
// // // // // // // //       console.warn(`Unexpected origin: ${origin}`);
// // // // // // // //       callback(null, true);
// // // // // // // //     }
// // // // // // // //   },
// // // // // // // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // // // // // // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // // // // // // //   credentials: true,
// // // // // // // //   optionsSuccessStatus: 204
// // // // // // // // };

// // // // // // // // app.use(cors(corsOptions));

// // // // // // // // // Body parser with size limit
// // // // // // // // app.use(express.json({ limit: '10kb' }));

// // // // // // // // // MongoDB Connection with enhanced retry logic and proper typing
// // // // // // // // const connectDB = async (): Promise<void> => {
// // // // // // // //   const maxRetries = 5;
// // // // // // // //   let retries = 0;

// // // // // // // //   while (retries < maxRetries) {
// // // // // // // //     try {
// // // // // // // //       const mongoUri = process.env.MONGO_URI;
// // // // // // // //       if (!mongoUri) {
// // // // // // // //         throw new Error('MongoDB URI is not defined');
// // // // // // // //       }

// // // // // // // //       await mongoose.connect(mongoUri, {
// // // // // // // //         serverSelectionTimeoutMS: 5000,
// // // // // // // //         socketTimeoutMS: 45000,
// // // // // // // //       });

// // // // // // // //       console.log('MongoDB connected successfully');
// // // // // // // //       return;
// // // // // // // //     } catch (err) {
// // // // // // // //       retries++;
// // // // // // // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // // // // // // //       if (retries === maxRetries) {
// // // // // // // //         console.error('Max retries reached. Exiting...');
// // // // // // // //         process.exit(1);
// // // // // // // //       }
      
// // // // // // // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // // // // // // //     }
// // // // // // // //   }
// // // // // // // // };

// // // // // // // // // Enhanced User Schema with proper validation
// // // // // // // // const UserSchema = new Schema<IUserDocument>({
// // // // // // // //   name: {
// // // // // // // //     type: String,
// // // // // // // //     required: [true, 'Name is required'],
// // // // // // // //     trim: true,
// // // // // // // //     minlength: [2, 'Name must be at least 2 characters'],
// // // // // // // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // // // // // // //   },
// // // // // // // //   email: {
// // // // // // // //     type: String,
// // // // // // // //     required: [true, 'Email is required'],
// // // // // // // //     unique: true,
// // // // // // // //     lowercase: true,
// // // // // // // //     trim: true,
// // // // // // // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // // // // // // //   }
// // // // // // // // }, {
// // // // // // // //   timestamps: true
// // // // // // // // });

// // // // // // // // // Add index for email field
// // // // // // // // UserSchema.index({ email: 1 });

// // // // // // // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // // // // // // Middleware to validate MongoDB ObjectId
// // // // // // // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // // // // // // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // // // // // // //     res.status(400).json({
// // // // // // // //       success: false,
// // // // // // // //       message: 'Invalid ID format'
// // // // // // // //     });
// // // // // // // //     return;
// // // // // // // //   }
// // // // // // // //   next();
// // // // // // // // };

// // // // // // // // // Routes with proper typing and validation
// // // // // // // // app.get('/', (_req: Request, res: Response) => {
// // // // // // // //   res.send('Backend Server is Running');
// // // // // // // // });

// // // // // // // // app.get('/api/health', (_req: Request, res: Response) => {
// // // // // // // //   res.status(200).json({
// // // // // // // //     status: 'healthy',
// // // // // // // //     timestamp: new Date().toISOString(),
// // // // // // // //     environment: process.env.NODE_ENV
// // // // // // // //   });
// // // // // // // // });

// // // // // // // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // // // // // // //   try {
// // // // // // // //     const users = await User.find()
// // // // // // // //       .select('-__v')
// // // // // // // //       .sort({ createdAt: -1 })
// // // // // // // //       .lean();

// // // // // // // //     res.json({
// // // // // // // //       success: true,
// // // // // // // //       count: users.length,
// // // // // // // //       data: users
// // // // // // // //     });
// // // // // // // //   } catch (error) {
// // // // // // // //     next(error);
// // // // // // // //   }
// // // // // // // // });

// // // // // // // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // // // // // // //   try {
// // // // // // // //     const { name, email } = req.body;

// // // // // // // //     // Input validation
// // // // // // // //     if (!name || !email) {
// // // // // // // //       return res.status(400).json({
// // // // // // // //         success: false,
// // // // // // // //         message: 'Please provide both name and email'
// // // // // // // //       });
// // // // // // // //     }

// // // // // // // //     // Check for existing user
// // // // // // // //     const existingUser = await User.findOne({ email }).lean();
// // // // // // // //     if (existingUser) {
// // // // // // // //       return res.status(400).json({
// // // // // // // //         success: false,
// // // // // // // //         message: 'Email already exists'
// // // // // // // //       });
// // // // // // // //     }

// // // // // // // //     const user = await User.create({ name, email });
// // // // // // // //     res.status(201).json({
// // // // // // // //       success: true,
// // // // // // // //       data: user
// // // // // // // //     });
// // // // // // // //   } catch (error) {
// // // // // // // //     next(error);
// // // // // // // //   }
// // // // // // // // });

// // // // // // // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // // // // // // //   try {
// // // // // // // //     const user = await User.findByIdAndDelete(req.params.id);
// // // // // // // //     if (!user) {
// // // // // // // //       return res.status(404).json({
// // // // // // // //         success: false,
// // // // // // // //         message: 'User not found'
// // // // // // // //       });
// // // // // // // //     }
    
// // // // // // // //     res.json({
// // // // // // // //       success: true,
// // // // // // // //       data: user
// // // // // // // //     });
// // // // // // // //   } catch (error) {
// // // // // // // //     next(error);
// // // // // // // //   }
// // // // // // // // });

// // // // // // // // // Enhanced error handling middleware with proper typing
// // // // // // // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // // // // // // //   console.error(err.stack);

// // // // // // // //   // MongoDB duplicate key error
// // // // // // // //   if (err.code === 11000) {
// // // // // // // //     return res.status(400).json({
// // // // // // // //       success: false,
// // // // // // // //       message: 'Duplicate field value entered'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   // MongoDB validation error
// // // // // // // //   if (err.name === 'ValidationError' && err.errors) {
// // // // // // // //     const messages = Object.values(err.errors).map(val => val.message);
// // // // // // // //     return res.status(400).json({
// // // // // // // //       success: false,
// // // // // // // //       message: messages.join(', ')
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   // Generic error response
// // // // // // // //   res.status(err.status || 500).json({
// // // // // // // //     success: false,
// // // // // // // //     message: err.message || 'Internal Server Error'
// // // // // // // //   });
// // // // // // // // };

// // // // // // // // app.use(errorHandler);

// // // // // // // // // Initialize database connection
// // // // // // // // connectDB().catch(console.error);

// // // // // // // // const PORT: number = parseInt(process.env.PORT || '5000', 10);
// // // // // // // // const HOST: string = '0.0.0.0';

// // // // // // // // // Start server
// // // // // // // // const server = app.listen(PORT, HOST, () => {
// // // // // // // //   console.log(`Server running on http://${HOST}:${PORT}`);
// // // // // // // // });

// // // // // // // // // Graceful shutdown
// // // // // // // // process.on('SIGTERM', () => {
// // // // // // // //   console.log('SIGTERM signal received. Closing HTTP server');
// // // // // // // //   server.close(() => {
// // // // // // // //     console.log('HTTP server closed');
// // // // // // // //     mongoose.connection.close(false).then(() => {
// // // // // // // //       console.log('MongoDB connection closed');
// // // // // // // //       process.exit(0);
// // // // // // // //     });
// // // // // // // //   });
// // // // // // // // });

// // // // // // // // export default app;
// // // // // // // import dotenv from 'dotenv';
// // // // // // // import express, { Request, Response, NextFunction } from 'express';
// // // // // // // import mongoose, { Document, Schema } from 'mongoose';
// // // // // // // import cors from 'cors';
// // // // // // // import helmet from 'helmet';
// // // // // // // import rateLimit from 'express-rate-limit';

// // // // // // // dotenv.config();

// // // // // // // // Types
// // // // // // // interface IUser {
// // // // // // //   name: string;
// // // // // // //   email: string;
// // // // // // //   createdAt?: Date;
// // // // // // //   updatedAt?: Date;
// // // // // // // }

// // // // // // // interface IUserDocument extends IUser, Document {}

// // // // // // // interface ErrorWithStatus extends Error {
// // // // // // //   status?: number;
// // // // // // //   code?: number;
// // // // // // //   errors?: { [key: string]: { message: string } };
// // // // // // // }

// // // // // // // // Express app initialization
// // // // // // // const app = express();

// // // // // // // // Security middleware
// // // // // // // app.use(helmet());

// // // // // // // // Health check endpoint - BEFORE rate limiting
// // // // // // // app.get('/api/health', (_req: Request, res: Response) => {
// // // // // // //   res.status(200).json({
// // // // // // //     status: 'healthy',
// // // // // // //     timestamp: new Date().toISOString(),
// // // // // // //     environment: process.env.NODE_ENV
// // // // // // //   });
// // // // // // // });

// // // // // // // // Rate limiting for API routes (excluding health check)
// // // // // // // const apiLimiter = rateLimit({
// // // // // // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // // // // // //   max: 100, // limit each IP to 100 requests per windowMs
// // // // // // //   message: 'Too many requests from this IP, please try again later'
// // // // // // // });

// // // // // // // // Apply rate limiting to specific routes
// // // // // // // app.use(['/api/users'], apiLimiter);

// // // // // // // // Enhanced CORS Configuration
// // // // // // // const allowedOrigins = [
// // // // // // //   'http://34.93.14.21',
// // // // // // //   'http://34.93.14.21:80',
// // // // // // //   'http://34.100.172.207:5000',
// // // // // // //   'http://localhost:3000',
// // // // // // //   'http://localhost:8080',
// // // // // // //   'http://jc.awsaparna123.xyz',
// // // // // // //   'http://jc1.awsaparna123.xyz',
// // // // // // //   'http://api.awsaparna123.xyz:5000',
// // // // // // // ].filter(Boolean);

// // // // // // // const corsOptions: cors.CorsOptions = {
// // // // // // //   origin: (origin, callback) => {
// // // // // // //     if (!origin) return callback(null, true);
// // // // // // //     if (allowedOrigins.includes(origin)) {
// // // // // // //       callback(null, true);
// // // // // // //     } else {
// // // // // // //       console.warn(`Unexpected origin: ${origin}`);
// // // // // // //       callback(null, true);
// // // // // // //     }
// // // // // // //   },
// // // // // // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // // // // // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // // // // // //   credentials: true,
// // // // // // //   optionsSuccessStatus: 204
// // // // // // // };

// // // // // // // app.use(cors(corsOptions));
// // // // // // // app.use(express.json({ limit: '10kb' }));

// // // // // // // // MongoDB Connection
// // // // // // // const connectDB = async (): Promise<void> => {
// // // // // // //   const maxRetries = 5;
// // // // // // //   let retries = 0;

// // // // // // //   while (retries < maxRetries) {
// // // // // // //     try {
// // // // // // //       const mongoUri = process.env.MONGO_URI;
// // // // // // //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// // // // // // //       await mongoose.connect(mongoUri, {
// // // // // // //         serverSelectionTimeoutMS: 5000,
// // // // // // //         socketTimeoutMS: 45000,
// // // // // // //       });

// // // // // // //       console.log('MongoDB connected successfully');
// // // // // // //       return;
// // // // // // //     } catch (err) {
// // // // // // //       retries++;
// // // // // // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // // // // // //       if (retries === maxRetries) {
// // // // // // //         console.error('Max retries reached. Exiting...');
// // // // // // //         process.exit(1);
// // // // // // //       }
      
// // // // // // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // // // // // //     }
// // // // // // //   }
// // // // // // // };

// // // // // // // // User Schema
// // // // // // // const UserSchema = new Schema<IUserDocument>({
// // // // // // //   name: {
// // // // // // //     type: String,
// // // // // // //     required: [true, 'Name is required'],
// // // // // // //     trim: true,
// // // // // // //     minlength: [2, 'Name must be at least 2 characters'],
// // // // // // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // // // // // //   },
// // // // // // //   email: {
// // // // // // //     type: String,
// // // // // // //     required: [true, 'Email is required'],
// // // // // // //     unique: true,
// // // // // // //     lowercase: true,
// // // // // // //     trim: true,
// // // // // // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // // // // // //   }
// // // // // // // }, {
// // // // // // //   timestamps: true
// // // // // // // });

// // // // // // // UserSchema.index({ email: 1 });
// // // // // // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // // // // // Middleware
// // // // // // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // // // // // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // // // // // //     res.status(400).json({ success: false, message: 'Invalid ID format' });
// // // // // // //     return;
// // // // // // //   }
// // // // // // //   next();
// // // // // // // };

// // // // // // // // Routes
// // // // // // // app.get('/', (_req: Request, res: Response) => {
// // // // // // //   res.send('Backend Server is Running');
// // // // // // // });

// // // // // // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // // // // // //   try {
// // // // // // //     const users = await User.find().select('-__v').sort({ createdAt: -1 }).lean();
// // // // // // //     res.json({ success: true, count: users.length, data: users });
// // // // // // //   } catch (error) {
// // // // // // //     next(error);
// // // // // // //   }
// // // // // // // });

// // // // // // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // // // // // //   try {
// // // // // // //     const { name, email } = req.body;
// // // // // // //     if (!name || !email) {
// // // // // // //       return res.status(400).json({
// // // // // // //         success: false,
// // // // // // //         message: 'Please provide both name and email'
// // // // // // //       });
// // // // // // //     }

// // // // // // //     const existingUser = await User.findOne({ email }).lean();
// // // // // // //     if (existingUser) {
// // // // // // //       return res.status(400).json({
// // // // // // //         success: false,
// // // // // // //         message: 'Email already exists'
// // // // // // //       });
// // // // // // //     }

// // // // // // //     const user = await User.create({ name, email });
// // // // // // //     res.status(201).json({ success: true, data: user });
// // // // // // //   } catch (error) {
// // // // // // //     next(error);
// // // // // // //   }
// // // // // // // });

// // // // // // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // // // // // //   try {
// // // // // // //     const user = await User.findByIdAndDelete(req.params.id);
// // // // // // //     if (!user) {
// // // // // // //       return res.status(404).json({
// // // // // // //         success: false,
// // // // // // //         message: 'User not found'
// // // // // // //       });
// // // // // // //     }
// // // // // // //     res.json({ success: true, data: user });
// // // // // // //   } catch (error) {
// // // // // // //     next(error);
// // // // // // //   }
// // // // // // // });

// // // // // // // // Error handling
// // // // // // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // // // // // //   console.error(err.stack);

// // // // // // //   if (err.code === 11000) {
// // // // // // //     return res.status(400).json({
// // // // // // //       success: false,
// // // // // // //       message: 'Duplicate field value entered'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   if (err.name === 'ValidationError' && err.errors) {
// // // // // // //     const messages = Object.values(err.errors).map(val => val.message);
// // // // // // //     return res.status(400).json({
// // // // // // //       success: false,
// // // // // // //       message: messages.join(', ')
// // // // // // //     });
// // // // // // //   }

// // // // // // //   res.status(err.status || 500).json({
// // // // // // //     success: false,
// // // // // // //     message: err.message || 'Internal Server Error'
// // // // // // //   });
// // // // // // // };

// // // // // // // app.use(errorHandler);

// // // // // // // // Server initialization
// // // // // // // const PORT: number = parseInt(process.env.PORT || '5000', 10);
// // // // // // // const HOST: string = '0.0.0.0';

// // // // // // // const server = app.listen(PORT, HOST, () => {
// // // // // // //   console.log(`Server running on http://${HOST}:${PORT}`);
// // // // // // // });

// // // // // // // // Graceful shutdown
// // // // // // // process.on('SIGTERM', () => {
// // // // // // //   console.log('SIGTERM signal received. Closing HTTP server');
// // // // // // //   server.close(() => {
// // // // // // //     console.log('HTTP server closed');
// // // // // // //     mongoose.connection.close(false).then(() => {
// // // // // // //       console.log('MongoDB connection closed');
// // // // // // //       process.exit(0);
// // // // // // //     });
// // // // // // //   });
// // // // // // // });

// // // // // // // connectDB().catch(console.error);

// // // // // // // export default app;
// // // // // // import dotenv from 'dotenv';
// // // // // // import express, { Request, Response, NextFunction } from 'express';
// // // // // // import mongoose, { Document, Schema } from 'mongoose';
// // // // // // import cors from 'cors';
// // // // // // import helmet from 'helmet';
// // // // // // import rateLimit from 'express-rate-limit';

// // // // // // dotenv.config();

// // // // // // // Types
// // // // // // interface IUser {
// // // // // //   name: string;
// // // // // //   email: string;
// // // // // //   createdAt?: Date;
// // // // // //   updatedAt?: Date;
// // // // // // }

// // // // // // interface IUserDocument extends IUser, Document {}

// // // // // // interface ErrorWithStatus extends Error {
// // // // // //   status?: number;
// // // // // //   code?: number;
// // // // // //   errors?: { [key: string]: { message: string } };
// // // // // // }

// // // // // // const app = express();

// // // // // // // Security middleware
// // // // // // app.use(helmet({
// // // // // //   contentSecurityPolicy: false,
// // // // // //   crossOriginEmbedderPolicy: false
// // // // // // }));

// // // // // // // Health check endpoint - BEFORE rate limiting
// // // // // // app.get('/api/health', (_req: Request, res: Response) => {
// // // // // //   res.status(200).json({
// // // // // //     status: 'healthy',
// // // // // //     timestamp: new Date().toISOString(),
// // // // // //     environment: process.env.NODE_ENV
// // // // // //   });
// // // // // // });

// // // // // // // Rate limiting
// // // // // // const apiLimiter = rateLimit({
// // // // // //   windowMs: 15 * 60 * 1000,
// // // // // //   max: 100,
// // // // // //   message: 'Too many requests from this IP, please try again later'
// // // // // // });

// // // // // // app.use('/api/users', apiLimiter);

// // // // // // // CORS configuration
// // // // // // const corsOptions: cors.CorsOptions = {
// // // // // //   origin: '*',  // In production, replace with specific domains
// // // // // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // // // // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // // // // //   credentials: true,
// // // // // //   optionsSuccessStatus: 204
// // // // // // };

// // // // // // app.use(cors(corsOptions));
// // // // // // app.use(express.json({ limit: '10kb' }));

// // // // // // // MongoDB Connection
// // // // // // const connectDB = async (): Promise<void> => {
// // // // // //   const maxRetries = 5;
// // // // // //   let retries = 0;

// // // // // //   while (retries < maxRetries) {
// // // // // //     try {
// // // // // //       const mongoUri = process.env.MONGO_URI;
// // // // // //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// // // // // //       await mongoose.connect(mongoUri);
// // // // // //       console.log('MongoDB connected successfully');
// // // // // //       return;
// // // // // //     } catch (err) {
// // // // // //       retries++;
// // // // // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // // // // //       if (retries === maxRetries) {
// // // // // //         console.error('Max retries reached. Exiting...');
// // // // // //         process.exit(1);
// // // // // //       }
      
// // // // // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // // // // //     }
// // // // // //   }
// // // // // // };

// // // // // // // User Schema
// // // // // // const UserSchema = new Schema<IUserDocument>({
// // // // // //   name: {
// // // // // //     type: String,
// // // // // //     required: [true, 'Name is required'],
// // // // // //     trim: true,
// // // // // //     minlength: [2, 'Name must be at least 2 characters'],
// // // // // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // // // // //   },
// // // // // //   email: {
// // // // // //     type: String,
// // // // // //     required: [true, 'Email is required'],
// // // // // //     unique: true,
// // // // // //     lowercase: true,
// // // // // //     trim: true,
// // // // // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // // // // //   }
// // // // // // }, {
// // // // // //   timestamps: true
// // // // // // });

// // // // // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // // // // Middleware
// // // // // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // // // // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // // // // //     res.status(400).json({ success: false, message: 'Invalid ID format' });
// // // // // //     return;
// // // // // //   }
// // // // // //   next();
// // // // // // };

// // // // // // // Routes
// // // // // // app.get('/', (_req: Request, res: Response) => {
// // // // // //   res.send('Backend Server is Running');
// // // // // // });

// // // // // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // // // // //   try {
// // // // // //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// // // // // //     res.json({ success: true, count: users.length, data: users });
// // // // // //   } catch (error) {
// // // // // //     next(error);
// // // // // //   }
// // // // // // });

// // // // // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // // // // //   try {
// // // // // //     const { name, email } = req.body;
// // // // // //     const user = await User.create({ name, email });
// // // // // //     res.status(201).json({ success: true, data: user });
// // // // // //   } catch (error) {
// // // // // //     next(error);
// // // // // //   }
// // // // // // });

// // // // // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // // // // //   try {
// // // // // //     const user = await User.findByIdAndDelete(req.params.id);
// // // // // //     if (!user) {
// // // // // //       return res.status(404).json({
// // // // // //         success: false,
// // // // // //         message: 'User not found'
// // // // // //       });
// // // // // //     }
// // // // // //     res.json({ success: true, data: user });
// // // // // //   } catch (error) {
// // // // // //     next(error);
// // // // // //   }
// // // // // // });

// // // // // // // Error handling
// // // // // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // // // // //   console.error(err);

// // // // // //   if (err.code === 11000) {
// // // // // //     return res.status(400).json({
// // // // // //       success: false,
// // // // // //       message: 'Duplicate field value entered'
// // // // // //     });
// // // // // //   }

// // // // // //   if (err.name === 'ValidationError' && err.errors) {
// // // // // //     const messages = Object.values(err.errors).map(val => val.message);
// // // // // //     return res.status(400).json({
// // // // // //       success: false,
// // // // // //       message: messages.join(', ')
// // // // // //     });
// // // // // //   }

// // // // // //   res.status(err.status || 500).json({
// // // // // //     success: false,
// // // // // //     message: err.message || 'Internal Server Error'
// // // // // //   });
// // // // // // };

// // // // // // app.use(errorHandler);

// // // // // // const PORT = process.env.PORT || 5000;
// // // // // // const server = app.listen(PORT, () => {
// // // // // //   console.log(`Server running on port ${PORT}`);
// // // // // // });

// // // // // // // Graceful shutdown
// // // // // // process.on('SIGTERM', () => {
// // // // // //   console.log('SIGTERM signal received. Closing HTTP server');
// // // // // //   server.close(() => {
// // // // // //     console.log('HTTP server closed');
// // // // // //     mongoose.connection.close(false).then(() => {
// // // // // //       console.log('MongoDB connection closed');
// // // // // //       process.exit(0);
// // // // // //     });
// // // // // //   });
// // // // // // });

// // // // // // connectDB().catch(console.error);

// // // // // // export default app;
// // // // // import dotenv from 'dotenv';
// // // // // import express, { Request, Response, NextFunction } from 'express';
// // // // // import mongoose, { Document, Schema } from 'mongoose';
// // // // // import cors from 'cors';
// // // // // import helmet from 'helmet';
// // // // // import rateLimit from 'express-rate-limit';

// // // // // dotenv.config();

// // // // // // Types
// // // // // interface IUser {
// // // // //   name: string;
// // // // //   email: string;
// // // // //   createdAt?: Date;
// // // // //   updatedAt?: Date;
// // // // // }

// // // // // interface IUserDocument extends IUser, Document {}

// // // // // interface ErrorWithStatus extends Error {
// // // // //   status?: number;
// // // // //   code?: number;
// // // // //   errors?: { [key: string]: { message: string } };
// // // // // }

// // // // // const app = express();

// // // // // // Security middleware
// // // // // app.use(helmet({
// // // // //   contentSecurityPolicy: false,
// // // // //   crossOriginResourcePolicy: { policy: "cross-origin" }
// // // // // }));

// // // // // // Health check endpoint - BEFORE rate limiting
// // // // // app.get('/api/health', (_req: Request, res: Response) => {
// // // // //   res.status(200).json({
// // // // //     status: 'healthy',
// // // // //     timestamp: new Date().toISOString(),
// // // // //     environment: process.env.NODE_ENV
// // // // //   });
// // // // // });

// // // // // // Rate limiting
// // // // // const apiLimiter = rateLimit({
// // // // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // // // //   max: 100,
// // // // //   message: 'Too many requests from this IP, please try again later'
// // // // // });

// // // // // app.use('/api/users', apiLimiter);

// // // // // // CORS configuration
// // // // // const corsOptions: cors.CorsOptions = {
// // // // //   origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
// // // // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // // // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // // // //   credentials: true,
// // // // //   optionsSuccessStatus: 204
// // // // // };

// // // // // app.use(cors(corsOptions));
// // // // // app.use(express.json({ limit: '10kb' }));

// // // // // // MongoDB Connection
// // // // // const connectDB = async (): Promise<void> => {
// // // // //   const maxRetries = 5;
// // // // //   let retries = 0;

// // // // //   while (retries < maxRetries) {
// // // // //     try {
// // // // //       const mongoUri = process.env.MONGO_URI;
// // // // //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// // // // //       await mongoose.connect(mongoUri);
// // // // //       console.log('MongoDB connected successfully');
// // // // //       return;
// // // // //     } catch (err) {
// // // // //       retries++;
// // // // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // // // //       if (retries === maxRetries) {
// // // // //         console.error('Max retries reached. Exiting...');
// // // // //         process.exit(1);
// // // // //       }
      
// // // // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // // // //     }
// // // // //   }
// // // // // };

// // // // // // User Schema
// // // // // const UserSchema = new Schema<IUserDocument>({
// // // // //   name: {
// // // // //     type: String,
// // // // //     required: [true, 'Name is required'],
// // // // //     trim: true,
// // // // //     minlength: [2, 'Name must be at least 2 characters'],
// // // // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // // // //   },
// // // // //   email: {
// // // // //     type: String,
// // // // //     required: [true, 'Email is required'],
// // // // //     unique: true,
// // // // //     lowercase: true,
// // // // //     trim: true,
// // // // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // // // //   }
// // // // // }, {
// // // // //   timestamps: true
// // // // // });

// // // // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // // // Middleware
// // // // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // // // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // // // //     res.status(400).json({ success: false, message: 'Invalid ID format' });
// // // // //     return;
// // // // //   }
// // // // //   next();
// // // // // };

// // // // // // Routes
// // // // // app.get('/', (_req: Request, res: Response) => {
// // // // //   res.send('Backend Server is Running');
// // // // // });

// // // // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // // // //   try {
// // // // //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// // // // //     res.json({ success: true, count: users.length, data: users });
// // // // //   } catch (error) {
// // // // //     next(error);
// // // // //   }
// // // // // });

// // // // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // // // //   try {
// // // // //     const { name, email } = req.body;
// // // // //     const user = await User.create({ name, email });
// // // // //     res.status(201).json({ success: true, data: user });
// // // // //   } catch (error) {
// // // // //     next(error);
// // // // //   }
// // // // // });

// // // // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // // // //   try {
// // // // //     const user = await User.findByIdAndDelete(req.params.id);
// // // // //     if (!user) {
// // // // //       return res.status(404).json({
// // // // //         success: false,
// // // // //         message: 'User not found'
// // // // //       });
// // // // //     }
// // // // //     res.json({ success: true, data: user });
// // // // //   } catch (error) {
// // // // //     next(error);
// // // // //   }
// // // // // });

// // // // // // Error handling
// // // // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // // // //   console.error(err);

// // // // //   if (err.code === 11000) {
// // // // //     return res.status(400).json({
// // // // //       success: false,
// // // // //       message: 'Duplicate field value entered'
// // // // //     });
// // // // //   }

// // // // //   if (err.name === 'ValidationError' && err.errors) {
// // // // //     const messages = Object.values(err.errors).map(val => val.message);
// // // // //     return res.status(400).json({
// // // // //       success: false,
// // // // //       message: messages.join(', ')
// // // // //     });
// // // // //   }

// // // // //   res.status(err.status || 500).json({
// // // // //     success: false,
// // // // //     message: err.message || 'Internal Server Error'
// // // // //   });
// // // // // };

// // // // // app.use(errorHandler);

// // // // // const PORT = process.env.PORT || 5000;
// // // // // const server = app.listen(PORT, () => {
// // // // //   console.log(`Server running on port ${PORT}`);
// // // // // });

// // // // // // Graceful shutdown
// // // // // process.on('SIGTERM', () => {
// // // // //   console.log('SIGTERM signal received. Closing HTTP server');
// // // // //   server.close(() => {
// // // // //     console.log('HTTP server closed');
// // // // //     mongoose.connection.close(false).then(() => {
// // // // //       console.log('MongoDB connection closed');
// // // // //       process.exit(0);
// // // // //     });
// // // // //   });
// // // // // });

// // // // // connectDB().catch(console.error);

// // // // // export default app;
// // // // import dotenv from 'dotenv';
// // // // import express, { Request, Response, NextFunction } from 'express';
// // // // import mongoose, { Document, Schema } from 'mongoose';
// // // // import cors from 'cors';
// // // // import helmet from 'helmet';
// // // // import rateLimit from 'express-rate-limit';

// // // // dotenv.config();

// // // // // Types
// // // // interface IUser {
// // // //   name: string;
// // // //   email: string;
// // // //   createdAt?: Date;
// // // //   updatedAt?: Date;
// // // // }

// // // // interface IUserDocument extends IUser, Document {}

// // // // interface ErrorWithStatus extends Error {
// // // //   status?: number;
// // // //   code?: number;
// // // //   errors?: { [key: string]: { message: string } };
// // // // }

// // // // const app = express();

// // // // // Security middleware
// // // // app.use(helmet());
// // // // // If you need to disable CSP and enable cross-origin resource policy, do it separately:
// // // // app.use(helmet.contentSecurityPolicy({
// // // //   useDefaults: false
// // // // }));
// // // // app.use(helmet.crossOriginResourcePolicy({
// // // //   policy: "cross-origin"
// // // // }));

// // // // // Health check endpoint - BEFORE rate limiting
// // // // app.get('/api/health', (_req: Request, res: Response) => {
// // // //   res.status(200).json({
// // // //     status: 'healthy',
// // // //     timestamp: new Date().toISOString(),
// // // //     environment: process.env.NODE_ENV
// // // //   });
// // // // });

// // // // // Rate limiting
// // // // const apiLimiter = rateLimit({
// // // //   windowMs: 15 * 60 * 1000, // 15 minutes
// // // //   max: 100,
// // // //   message: 'Too many requests from this IP, please try again later'
// // // // });

// // // // app.use('/api/users', apiLimiter);

// // // // // CORS configuration
// // // // const corsOptions: cors.CorsOptions = {
// // // //   origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
// // // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // // //   credentials: true,
// // // //   optionsSuccessStatus: 204
// // // // };

// // // // app.use(cors(corsOptions));
// // // // app.use(express.json({ limit: '10kb' }));

// // // // // MongoDB Connection
// // // // const connectDB = async (): Promise<void> => {
// // // //   const maxRetries = 5;
// // // //   let retries = 0;

// // // //   while (retries < maxRetries) {
// // // //     try {
// // // //       const mongoUri = process.env.MONGO_URI;
// // // //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// // // //       await mongoose.connect(mongoUri);
// // // //       console.log('MongoDB connected successfully');
// // // //       return;
// // // //     } catch (err) {
// // // //       retries++;
// // // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // // //       if (retries === maxRetries) {
// // // //         console.error('Max retries reached. Exiting...');
// // // //         process.exit(1);
// // // //       }
      
// // // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // // //     }
// // // //   }
// // // // };

// // // // // User Schema
// // // // const UserSchema = new Schema<IUserDocument>({
// // // //   name: {
// // // //     type: String,
// // // //     required: [true, 'Name is required'],
// // // //     trim: true,
// // // //     minlength: [2, 'Name must be at least 2 characters'],
// // // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // // //   },
// // // //   email: {
// // // //     type: String,
// // // //     required: [true, 'Email is required'],
// // // //     unique: true,
// // // //     lowercase: true,
// // // //     trim: true,
// // // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // // //   }
// // // // }, {
// // // //   timestamps: true
// // // // });

// // // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // // Middleware
// // // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // // //     res.status(400).json({ success: false, message: 'Invalid ID format' });
// // // //     return;
// // // //   }
// // // //   next();
// // // // };

// // // // // Routes
// // // // app.get('/', (_req: Request, res: Response) => {
// // // //   res.send('Backend Server is Running');
// // // // });

// // // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // // //   try {
// // // //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// // // //     res.json({ success: true, count: users.length, data: users });
// // // //   } catch (error) {
// // // //     next(error);
// // // //   }
// // // // });

// // // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // // //   try {
// // // //     const { name, email } = req.body;
// // // //     const user = await User.create({ name, email });
// // // //     res.status(201).json({ success: true, data: user });
// // // //   } catch (error) {
// // // //     next(error);
// // // //   }
// // // // });

// // // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // // //   try {
// // // //     const user = await User.findByIdAndDelete(req.params.id);
// // // //     if (!user) {
// // // //       return res.status(404).json({
// // // //         success: false,
// // // //         message: 'User not found'
// // // //       });
// // // //     }
// // // //     res.json({ success: true, data: user });
// // // //   } catch (error) {
// // // //     next(error);
// // // //   }
// // // // });

// // // // // Error handling
// // // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // // //   console.error(err);

// // // //   if (err.code === 11000) {
// // // //     return res.status(400).json({
// // // //       success: false,
// // // //       message: 'Duplicate field value entered'
// // // //     });
// // // //   }

// // // //   if (err.name === 'ValidationError' && err.errors) {
// // // //     const messages = Object.values(err.errors).map(val => val.message);
// // // //     return res.status(400).json({
// // // //       success: false,
// // // //       message: messages.join(', ')
// // // //     });
// // // //   }

// // // //   res.status(err.status || 500).json({
// // // //     success: false,
// // // //     message: err.message || 'Internal Server Error'
// // // //   });
// // // // };

// // // // app.use(errorHandler);

// // // // const PORT = process.env.PORT || 5000;
// // // // const server = app.listen(PORT, () => {
// // // //   console.log(`Server running on port ${PORT}`);
// // // // });

// // // // // Graceful shutdown
// // // // process.on('SIGTERM', () => {
// // // //   console.log('SIGTERM signal received. Closing HTTP server');
// // // //   server.close(() => {
// // // //     console.log('HTTP server closed');
// // // //     mongoose.connection.close(false).then(() => {
// // // //       console.log('MongoDB connection closed');
// // // //       process.exit(0);
// // // //     });
// // // //   });
// // // // });

// // // // connectDB().catch(console.error);

// // // // export default app;
// // // import dotenv from 'dotenv';
// // // import express, { Request, Response, NextFunction } from 'express';
// // // import mongoose, { Document, Schema } from 'mongoose';
// // // import cors from 'cors';
// // // import helmet from 'helmet';
// // // import rateLimit from 'express-rate-limit';

// // // dotenv.config();

// // // // Types
// // // interface IUser {
// // //   name: string;
// // //   email: string;
// // //   createdAt?: Date;
// // //   updatedAt?: Date;
// // // }

// // // interface IUserDocument extends IUser, Document {}

// // // interface ErrorWithStatus extends Error {
// // //   status?: number;
// // //   code?: number;
// // //   errors?: { [key: string]: { message: string } };
// // // }

// // // const app = express();

// // // // Security middleware
// // // app.use(helmet({
// // //   contentSecurityPolicy: false,
// // //   crossOriginEmbedderPolicy: false,
// // //   crossOriginResourcePolicy: { policy: "cross-origin" }
// // // }));

// // // // Health check endpoint - BEFORE rate limiting
// // // app.get('/api/health', (_req: Request, res: Response) => {
// // //   res.status(200).json({
// // //     status: 'healthy',
// // //     timestamp: new Date().toISOString(),
// // //     environment: process.env.NODE_ENV
// // //   });
// // // });

// // // // Rate limiting
// // // const apiLimiter = rateLimit({
// // //   windowMs: 15 * 60 * 1000,
// // //   max: 100,
// // //   message: 'Too many requests from this IP, please try again later'
// // // });

// // // app.use('/api/users', apiLimiter);

// // // // CORS configuration
// // // const allowedOrigins = process.env.NODE_ENV === 'production' 
// // //   ? ['http://awsaparna123.xyz', 'http://api.awsaparna123.xyz:5000']
// // //   : ['http://localhost:3000'];

// // // const corsOptions: cors.CorsOptions = {
// // //   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
// // //     if (!origin || allowedOrigins.includes(origin)) {
// // //       callback(null, true);
// // //     } else {
// // //       callback(new Error('Not allowed by CORS'));
// // //     }
// // //   },
// // //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization'],
// // //   credentials: true,
// // //   optionsSuccessStatus: 204
// // // };

// // // app.use(cors(corsOptions));
// // // app.use(express.json({ limit: '10kb' }));

// // // // MongoDB Connection
// // // const connectDB = async (): Promise<void> => {
// // //   const maxRetries = 5;
// // //   let retries = 0;

// // //   while (retries < maxRetries) {
// // //     try {
// // //       const mongoUri = process.env.MONGO_URI;
// // //       if (!mongoUri) throw new Error('MongoDB URI is not defined');

// // //       await mongoose.connect(mongoUri);
// // //       console.log('MongoDB connected successfully');
// // //       return;
// // //     } catch (err) {
// // //       retries++;
// // //       console.error(`MongoDB connection attempt ${retries} failed:`, err);
      
// // //       if (retries === maxRetries) {
// // //         console.error('Max retries reached. Exiting...');
// // //         process.exit(1);
// // //       }
      
// // //       await new Promise(resolve => setTimeout(resolve, 5000));
// // //     }
// // //   }
// // // };

// // // // User Schema
// // // const UserSchema = new Schema<IUserDocument>({
// // //   name: {
// // //     type: String,
// // //     required: [true, 'Name is required'],
// // //     trim: true,
// // //     minlength: [2, 'Name must be at least 2 characters'],
// // //     maxlength: [50, 'Name cannot be more than 50 characters']
// // //   },
// // //   email: {
// // //     type: String,
// // //     required: [true, 'Email is required'],
// // //     unique: true,
// // //     lowercase: true,
// // //     trim: true,
// // //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
// // //   }
// // // }, {
// // //   timestamps: true
// // // });

// // // const User = mongoose.model<IUserDocument>('User', UserSchema);

// // // // Middleware
// // // const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
// // //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// // //     res.status(400).json({ success: false, message: 'Invalid ID format' });
// // //     return;
// // //   }
// // //   next();
// // // };

// // // // Routes
// // // app.get('/api/users', async (_req: Request, res: Response, next: NextFunction) => {
// // //   try {
// // //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// // //     res.json({ success: true, count: users.length, data: users });
// // //   } catch (error) {
// // //     next(error);
// // //   }
// // // });

// // // app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
// // //   try {
// // //     const { name, email } = req.body;
// // //     const user = await User.create({ name, email });
// // //     res.status(201).json({ success: true, data: user });
// // //   } catch (error) {
// // //     next(error);
// // //   }
// // // });

// // // app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response, next: NextFunction) => {
// // //   try {
// // //     const user = await User.findByIdAndDelete(req.params.id);
// // //     if (!user) {
// // //       return res.status(404).json({
// // //         success: false,
// // //         message: 'User not found'
// // //       });
// // //     }
// // //     res.json({ success: true, data: user });
// // //   } catch (error) {
// // //     next(error);
// // //   }
// // // });

// // // // Error handling
// // // const errorHandler = (err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
// // //   console.error(err);

// // //   if (err.code === 11000) {
// // //     return res.status(400).json({
// // //       success: false,
// // //       message: 'Duplicate field value entered'
// // //     });
// // //   }

// // //   if (err.name === 'ValidationError' && err.errors) {
// // //     const messages = Object.values(err.errors).map(val => val.message);
// // //     return res.status(400).json({
// // //       success: false,
// // //       message: messages.join(', ')
// // //     });
// // //   }

// // //   res.status(err.status || 500).json({
// // //     success: false,
// // //     message: err.message || 'Internal Server Error'
// // //   });
// // // };

// // // app.use(errorHandler);

// // // const PORT = process.env.PORT || 5000;
// // // const server = app.listen(PORT, () => {
// // //   console.log(`Server running on port ${PORT}`);
// // // });

// // // // Graceful shutdown
// // // process.on('SIGTERM', () => {
// // //   console.log('SIGTERM signal received. Closing HTTP server');
// // //   server.close(() => {
// // //     console.log('HTTP server closed');
// // //     mongoose.connection.close(false).then(() => {
// // //       console.log('MongoDB connection closed');
// // //       process.exit(0);
// // //     });
// // //   });
// // // });

// // // connectDB().catch(console.error);

// // // export default app;
// // import dotenv from 'dotenv';
// // import express from 'express';
// // import mongoose from 'mongoose';
// // import cors from 'cors';
// // import helmet from 'helmet';
// // import rateLimit from 'express-rate-limit';

// // dotenv.config();

// // const app = express();

// // // Security middleware
// // app.use(helmet({
// //   contentSecurityPolicy: false,
// //   crossOriginEmbedderPolicy: false,
// //   crossOriginResourcePolicy: { policy: "cross-origin" }
// // }));

// // // Basic middleware
// // app.use(express.json({ limit: '10kb' }));

// // // CORS configuration - Updated to be more permissive in development
// // const corsOptions = {
// //   origin: process.env.NODE_ENV === 'production'
// //     ? ['http://awsaparna123.xyz', 'http://api.awsaparna123.xyz:5000', 'http://api.awsaparna123.xyz']
// //     : true,
// //   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// //   credentials: false, // Changed to false since we're using different domains
// //   optionsSuccessStatus: 200
// // };

// // app.use(cors(corsOptions));

// // // Health check endpoint - BEFORE rate limiting
// // app.get('/api/health', (_req, res) => {
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
// // const connectDB = async () => {
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
// // const UserSchema = new mongoose.Schema({
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

// // const User = mongoose.model('User', UserSchema);

// // // Middleware for ID validation
// // const validateObjectId = (req, res, next) => {
// //   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
// //     return res.status(400).json({ 
// //       success: false, 
// //       message: 'Invalid ID format' 
// //     });
// //   }
// //   next();
// // };

// // // Routes
// // app.get('/api/users', async (_req, res) => {
// //   try {
// //     const users = await User.find().select('-__v').sort({ createdAt: -1 });
// //     res.json({ 
// //       success: true, 
// //       count: users.length, 
// //       data: users 
// //     });
// //   } catch (error) {
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Error fetching users',
// //       error: error.message 
// //     });
// //   }
// // });

// // app.post('/api/users', async (req, res) => {
// //   try {
// //     const { name, email } = req.body;
// //     const user = await User.create({ name, email });
// //     res.status(201).json({ 
// //       success: true, 
// //       data: user 
// //     });
// //   } catch (error) {
// //     if (error.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Email already exists'
// //       });
// //     }
// //     res.status(400).json({ 
// //       success: false, 
// //       message: error.message 
// //     });
// //   }
// // });

// // app.delete('/api/users/:id', validateObjectId, async (req, res) => {
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
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Error deleting user',
// //       error: error.message 
// //     });
// //   }
// // });

// // // Error handling middleware
// // app.use((err, _req, res, _next) => {
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
// import express, { Request, Response, NextFunction } from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

// dotenv.config();

// interface IUser {
//   name: string;
//   email: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// interface IErrorWithCode extends Error {
//   code?: number;
// }

// const app = express();

// // Security middleware
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // Basic middleware
// app.use(express.json({ limit: '10kb' }));

// // CORS configuration
// const corsOptions: cors.CorsOptions = {
//   origin: process.env.NODE_ENV === 'production'
//     ? ['http://awsaparna123.xyz', 'http://api.awsaparna123.xyz:5000', 'http://api.awsaparna123.xyz']
//     : true,
//   methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: false,
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

// // Health check endpoint
// app.get('/api/health', (_req: Request, res: Response) => {
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
// const connectDB = async (): Promise<void> => {
//   const maxRetries = 5;
//   let retries = 0;

//   while (retries < maxRetries) {
//     try {
//       const mongoUri = process.env.MONGO_URI;
//       if (!mongoUri) throw new Error('MongoDB URI is not defined');

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
// const UserSchema = new mongoose.Schema<IUser>({
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

// const User = mongoose.model<IUser>('User', UserSchema);

// // Middleware for ID validation
// const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
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
// app.get('/api/users', async (_req: Request, res: Response) => {
//   try {
//     const users = await User.find().select('-__v').sort({ createdAt: -1 });
//     res.json({ 
//       success: true, 
//       count: users.length, 
//       data: users 
//     });
//   } catch (error) {
//     const err = error as Error;
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching users',
//       error: err.message 
//     });
//   }
// });

// app.post('/api/users', async (req: Request, res: Response) => {
//   try {
//     const { name, email } = req.body;
//     const user = await User.create({ name, email });
//     res.status(201).json({ 
//       success: true, 
//       data: user 
//     });
//   } catch (error) {
//     const err = error as IErrorWithCode;
//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already exists'
//       });
//     }
//     res.status(400).json({ 
//       success: false, 
//       message: err.message 
//     });
//   }
// });

// app.delete('/api/users/:id', validateObjectId, async (req: Request, res: Response) => {
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
//     const err = error as Error;
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error deleting user',
//       error: err.message 
//     });
//   }
// });

// // Error handling middleware
// app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
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

interface IUser {
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IErrorWithCode extends Error {
  code?: number;
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Basic middleware
app.use(express.json({ limit: '10kb' }));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['http://awsaparna123.xyz', 'http://api.awsaparna123.xyz:5000', 'http://api.awsaparna123.xyz', 'http://localhost:3000']
    : true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Health check endpoint - Changed to match frontend request
app.get('/health', (_req: Request, res: Response) => {
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

app.use('/users', apiLimiter);

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) throw new Error('MongoDB URI is not defined');

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

// Routes - Changed to match frontend requests
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: users.length, 
      data: users 
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: err.message 
    });
  }
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    const err = error as IErrorWithCode;
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
});

app.delete('/users/:id', validateObjectId, async (req: Request, res: Response) => {
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
    const err = error as Error;
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: err.message 
    });
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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
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
