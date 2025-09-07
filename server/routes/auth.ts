import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { generateToken, authenticateUser } from '../middleware/auth';
import { insertUserSchema } from '@shared/schema';

const router = Router();

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const userData = {
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName || null,
      lastName: validatedData.lastName || null,
      role: 'user',
      isEmailVerified: false,
      hasCompletedIntake: false,
    };

    const user = await storage.createUser(userData);
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Log activity
    await storage.logActivity({
      projectId: 0, // System-level activity
      userId: user.id,
      action: 'User registered',
      entityType: 'user',
      entityId: user.id,
      entityName: user.username,
      details: { email: user.email },
      isVisible: true,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        hasCompletedIntake: user.hasCompletedIntake,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Log activity
    await storage.logActivity({
      projectId: 0, // System-level activity
      userId: user.id,
      action: 'User logged in',
      entityType: 'user',
      entityId: user.id,
      entityName: user.username,
      details: { loginTime: new Date() },
      isVisible: false, // Don't show login activities to collaborators
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        hasCompletedIntake: user.hasCompletedIntake,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo login for development/testing
router.post('/demo-login', async (req, res) => {
  try {
    // Get the demo user
    const user = await storage.getUserByEmail('demo@example.com');
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    // Create a session ID for demo user
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session in memory storage
    await storage.createSession({
      sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Log demo login activity
    try {
      await storage.logActivity({
        projectId: 0, // System-level activity
        userId: user.id,
        action: 'Demo login',
        entityType: 'user',
        entityId: user.id,
        entityName: user.username,
        details: { loginType: 'demo' },
        isVisible: false,
      });
    } catch (error) {
      // Ignore activity logging errors for demo
      console.log('Demo activity logging skipped');
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        hasCompletedIntake: user.hasCompletedIntake,
        avatar: user.avatar,
      },
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's projects
    const projects = await storage.getWeddingProjectsByUserId(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasCompletedIntake: user.hasCompletedIntake,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        date: p.date,
        venue: p.venue,
        role: p.createdBy === user.id ? 'admin' : 'collaborator'
      }))
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Logout (client-side token removal, but we can log the activity)
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // Log activity
    await storage.logActivity({
      projectId: 0, // System-level activity
      userId: req.user!.id,
      action: 'User logged out',
      entityType: 'user',
      entityId: req.user!.id,
      entityName: req.user!.username,
      details: { logoutTime: new Date() },
      isVisible: false,
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;