import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCourseSchema, 
  insertEnrollmentSchema,
  insertOpportunitySchema,
  insertMentorSchema,
  insertArticleSchema,
  insertCertificateSchema,
  insertStatsSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);
  
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "portfol-io-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Configure passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (user.password !== password) { // In production, use bcrypt or similar for password hashing
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Authentication middleware
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }
  
  // Error handling for Zod validation
  function validateRequest(schema: any, body: any) {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  }
  
  // API routes
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create initial stats for user
      await storage.createUserStats({
        userId: user.id,
        coursesInProgress: 0,
        certificatesEarned: 0,
        mentorSessions: 0,
        opportunitiesSaved: 0
      });
      
      // Login the user after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Firebase auth registration
  app.post("/api/register/firebase", async (req, res) => {
    try {
      const { uid, email, displayName, photoURL, username, firstName, lastName } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ message: "Missing required Firebase auth data" });
      }
      
      // Check if user already exists by email
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        // If user exists, log them in
        req.login(existingEmail, (err) => {
          if (err) {
            return res.status(500).json({ message: "Error logging in existing user" });
          }
          return res.json({ user: { ...existingEmail, password: undefined } });
        });
        return;
      }
      
      // Create a new user
      const userData = {
        // Generate a username from email if not provided
        username: username || email.split('@')[0],
        email,
        // Use display name or email for first name if not provided
        firstName: firstName || displayName?.split(' ')[0] || email.split('@')[0],
        lastName: lastName || (displayName?.split(' ').slice(1).join(' ') || null),
        // Use a random password as Firebase handles auth
        password: `firebase_${uid}_${Math.random().toString(36).slice(2, 10)}`,
        profileImage: photoURL || null
      };
      
      const user = await storage.createUser(userData);
      
      // Create initial stats for user
      await storage.createUserStats({
        userId: user.id,
        coursesInProgress: 0,
        certificatesEarned: 0,
        mentorSessions: 0,
        opportunitiesSaved: 0
      });
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after Firebase registration" });
        }
        return res.status(201).json({ user: { ...user, password: undefined } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Firebase auth login
  app.post("/api/login/firebase", async (req, res) => {
    try {
      const { uid, email } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ message: "Missing required Firebase auth data" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found. Please register first." });
      }
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in with Firebase" });
        }
        return res.json({ user: { ...user, password: undefined } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // If this function gets called, authentication was successful
    // req.user contains the authenticated user
    res.json({ user: { ...req.user, password: undefined } });
  });
  
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/user", isAuthenticated, (req, res) => {
    // Return the current authenticated user
    res.json({ user: { ...req.user, password: undefined } });
  });
  
  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(Number(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courseData = validateRequest(insertCourseSchema, req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/user/courses", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const courses = await storage.getUserCourses(userId);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Enrollment routes
  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollmentData = validateRequest(insertEnrollmentSchema, {
        ...req.body,
        userId: (req.user as any).id
      });
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(
        enrollmentData.userId, 
        enrollmentData.courseId
      );
      
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch("/api/enrollments/:courseId/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const courseId = Number(req.params.courseId);
      const { progress } = req.body;
      
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      const updatedEnrollment = await storage.updateEnrollmentProgress(
        userId,
        courseId,
        progress
      );
      
      if (!updatedEnrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      res.json(updatedEnrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getOpportunity(Number(req.params.id));
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/opportunities", isAuthenticated, async (req, res) => {
    try {
      const opportunityData = validateRequest(insertOpportunitySchema, req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Mentor routes
  app.get("/api/mentors", async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/mentors/:id", async (req, res) => {
    try {
      const mentor = await storage.getMentor(Number(req.params.id));
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      res.json(mentor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/mentors", isAuthenticated, async (req, res) => {
    try {
      const mentorData = validateRequest(insertMentorSchema, req.body);
      const mentor = await storage.createMentor(mentorData);
      res.status(201).json(mentor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Article routes
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(Number(req.params.id));
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/articles", isAuthenticated, async (req, res) => {
    try {
      const articleData = validateRequest(insertArticleSchema, req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Certificate routes
  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const certificateData = validateRequest(insertCertificateSchema, {
        ...req.body,
        userId: (req.user as any).id
      });
      
      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        // Create stats if they don't exist
        const newStats = await storage.createUserStats({
          userId,
          coursesInProgress: 0,
          certificatesEarned: 0,
          mentorSessions: 0,
          opportunitiesSaved: 0
        });
        
        return res.json(newStats);
      }
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
