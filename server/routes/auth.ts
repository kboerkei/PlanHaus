import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { sessions, generateSessionId } from "../middleware/auth";
import { setSecureCookie, clearSecureCookie } from "../middleware/cookieAuth";
import { validateBody } from "../utils/validation";
import { logError, logInfo } from "../utils/logger";
import { insertUserSchema } from "@shared/schema";

const router = Router();

// Login validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post("/register", validateBody(insertUserSchema), async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await storage.createUser(userData);
    const sessionId = generateSessionId();
    sessions.set(sessionId, { userId: user.id });

    // Set secure httpOnly cookie
    setSecureCookie(res, sessionId);

    logInfo('auth', `New user registered: ${user.email}`);

    res.json({ 
      user: { 
        id: user.id.toString(), 
        username: user.username, 
        email: user.email, 
        hasCompletedIntake: false 
      }
      // sessionId removed - now in httpOnly cookie
    });
  } catch (error) {
    logError('auth', error, { endpoint: 'register' });
    res.status(400).json({ message: "Registration failed" });
  }
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      logInfo('auth', `Failed login attempt for email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionId = generateSessionId();
    sessions.set(sessionId, { userId: user.id });

    // Set secure httpOnly cookie
    setSecureCookie(res, sessionId);

    logInfo('auth', `User logged in: ${user.email}`);

    res.json({ 
      user: { 
        id: user.id.toString(), 
        username: user.username, 
        email: user.email, 
        hasCompletedIntake: !!user.hasCompletedIntake 
      }
      // sessionId removed - now in httpOnly cookie
    });
  } catch (error) {
    logError('auth', error, { endpoint: 'login' });
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/demo-login", async (req, res) => {
  try {
    // Try to get existing demo user first
    let demoUser = await storage.getUserByEmail("demo@planhaus.com");
    
    // If not found, try the fallback demo user that exists in the database
    if (!demoUser) {
      demoUser = await storage.getUserByEmail("demo@example.com");
    }
    
    // If still not found, return error instead of trying to create
    if (!demoUser) {
      logError('auth', new Error('Demo user not found in database'), { endpoint: 'demo-login' });
      return res.status(404).json({ message: "Demo user not found. Please contact support." });
    }

    const sessionId = generateSessionId();
    sessions.set(sessionId, { userId: demoUser.id });

    logInfo('auth', 'Demo login successful');

    // Set secure httpOnly cookie
    setSecureCookie(res, sessionId);

    res.json({
      user: { 
        id: demoUser.id.toString(), 
        username: demoUser.username, 
        email: demoUser.email, 
        hasCompletedIntake: true 
      }
      // sessionId removed - now in httpOnly cookie
    });
  } catch (error) {
    logError('auth', error, { endpoint: 'demo-login' });
    res.status(500).json({ message: "Demo login failed" });
  }
});

router.get("/me", async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const session = sessions.get(sessionId)!;
    const user = await storage.getUserById(session.userId);
    
    if (!user) {
      sessions.delete(sessionId);
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ 
      id: user.id.toString(), 
      username: user.username, 
      email: user.email, 
      hasCompletedIntake: !!user.hasCompletedIntake 
    });
  } catch (error) {
    logError('auth', error, { endpoint: 'me' });
    res.status(500).json({ message: "Failed to get user info" });
  }
});

export default router;