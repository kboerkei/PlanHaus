import express from "express";
import { requireAuth } from "../middleware/auth";
import { 
  apiLimiter, 
  authLimiter, 
  aiLimiter, 
  securityHeaders,
  validateInput,
  preventSQLInjection 
} from "../middleware/security";
import { enhancedRequireAuth } from "../middleware/enhanced-auth";

// Import existing route modules
import authRoutes from "./auth";
import projectRoutes from "./projects";
import taskRoutes from "./tasks";
import guestRoutes from "./guests";
import vendorRoutes from "./vendors";
import budgetRoutes from "./budget";
import aiRoutes from "./ai";
import aiSuggestionsRoutes from "./ai-suggestions";
import uploadRoutes from "./upload";
import exportRoutes from "./export";

export function setupSecureRoutes(app: express.Application) {
  // Apply security headers globally
  app.use(securityHeaders);
  
  // Apply SQL injection prevention
  app.use(preventSQLInjection);

  // Apply rate limiting to different route groups
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/ai", aiLimiter, enhancedRequireAuth, aiRoutes);
  app.use("/api/ai", aiLimiter, enhancedRequireAuth, aiSuggestionsRoutes);
  
  // Apply general API rate limiting to other routes
  app.use("/api/projects", apiLimiter, enhancedRequireAuth, projectRoutes);
  app.use("/api/tasks", apiLimiter, enhancedRequireAuth, taskRoutes);
  app.use("/api/guests", apiLimiter, enhancedRequireAuth, guestRoutes);
  app.use("/api/vendors", apiLimiter, enhancedRequireAuth, vendorRoutes);
  app.use("/api/budget-items", apiLimiter, enhancedRequireAuth, budgetRoutes);
  app.use("/api/upload", apiLimiter, enhancedRequireAuth, uploadRoutes);
  app.use("/api/export", apiLimiter, enhancedRequireAuth, exportRoutes);

  return app;
}