import { Request, Response, Router } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

interface JWTPayload {
  id: string;
  email: string;
  name: string
}

export class AuthController {
  private prisma: PrismaClient;
  public router: Router;

  constructor() {

    this.prisma = new PrismaClient();
    this.router = Router();
    this.setupRoutes();
  }


  private setupRoutes() {

    this.router.post("/login", (req, res) => this.login(req, res));
    this.router.post("/register", (req, res) => this.register(req, res));
    this.router.post("/validate-token", (req, res) => this.validateToken(req, res));
    this.router.post("/logout", (req, res) => this.logout(req, res));

  }

  private async login(req: Request, res: Response) {
    try {

      const { email, password } = req.body;

      if(!email || !password) {
        res.status(400).json({ message: "Invalid credentials", success: false})
        return
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email
        }
      });

      if (!existingUser) {
        res.status(404).json({ 
          message: "User not found", 
          success: false 
        });
        return
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        res.status(401).json({ 
          message: "Invalid credentials", 
          success: false 
        });
        return
      }

      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, name: existingUser.name } as JWTPayload, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: '1h' }
      );

      await this.prisma.session.create({
        data: {
          token: token,
          expiresAt: new Date(Date.now() + 3600000),
          userId: existingUser.id
        }
      });

      res.status(200).json({ 
        message: "Login successful", 
        success: true, 
        token,
        user: existingUser
      });

    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ 
        message: "Server error during login", 
        success: false 
      });
    }
  }

  private async logout(req: Request, res: Response) {
    try {

      const { userid } = req.body;
      
      if (!userid) {
        res.status(400).json({ 
          message: "User ID is required", 
          success: false 
        });
        return
      }
        await this.prisma.session.deleteMany({
        where: {
          userId: userid
        }
      });
  
      res.status(200).json({
        message: "Logged out successfully from all sessions",
        success: true
      });
      return
  
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({
        message: "Server error during logout",
        success: false
      });
      return
    }
  }

  private async register(req: Request, res: Response) {
    try {


      const { email, password, name } = req.body;

      if(!email || !password || !name) {
        res.status(400).json({ message: "Invalid credentials", success: false})
        return
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email
        }
      })
      if (existingUser) {
        res.status(409).json({ 
          message: "User already exists", 
          success: false 
        });
        return
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      res.status(201).json({ 
        message: "User registered successfully", 
        success: true, 
        id: newUser.id 
      });
      return

    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ 
        message: "Server error during registration", 
        success: false 
      });
    }
  }

  private async validateToken(req: Request, res: Response) {
    try {

      const { token } = req.body;

        const session = await this.prisma.session.findUnique({
          where: { token }
        });

        if (!session) {
          res.status(401).json({
              message: "Invalid token",
              success: false
          });
          return
        }

        if (session.expiresAt < new Date()) {
            await this.prisma.session.delete({
              where: { token }
            });

            res.status(401).json({
              message: "Token expired",
              success: false
            });
            return
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback_secret',
                { algorithms: ['HS256'] }
            ) as JWTPayload;

            const newToken = jwt.sign(
                { id: decoded.id, email: decoded.email, name: decoded.name }, 
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1h' }
            );

            await this.prisma.session.update({
                where: { token },
                data: {
                    token: newToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
                }
            });

            res.status(200).json({
                message: "Token is valid",
                success: true,
                user: decoded,
                ntoken: newToken
            });
            return

        } catch (jwtError) {
            res.status(401).json({
                message: "Invalid token signature",
                success: false
            });
            return
        }

    } catch (error) {
        console.error("Token Verification Error:", error);
        res.status(500).json({
            message: "Server error during token verification",
            success: false
        });
        return
    }
  }
}