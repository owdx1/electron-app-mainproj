import express, { Request, Response } from "express"
import { AuthController } from "../controllers/AuthController";
import cors from "cors";
export class HttpExpressService {

  private app: express.Application
  private authController: AuthController

  constructor(app: express.Application) {

    this.app = app;

    app.use(cors({
      credentials: true
    }));
    app.use(express.json()); // Parse JSON bodies
    app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

    this.authController = new AuthController()

    this.SetupRoutes();

  }

  private SetupRoutes(): void {

    this.app.get("/", (req: Request, res: Response) => {
      console.log("Accepted")
      res.status(200).json({"message": "hello"})
    })  

    this.app.use("/api/auth/", this.authController.router)

  }
}