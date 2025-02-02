import express, { Request, Response } from "express"
import { DBService } from "./DBService";
import { AuthController } from "../controllers/AuthController";
export class HttpExpressService {

  private app: express.Application
  private dbService: DBService;
  private authController: AuthController

  constructor(app: express.Application, dbService: DBService) {

    this.app = app;
    this.dbService = dbService;
    this.authController = new AuthController(dbService)

    this.SetupRoutes();

  }

  private SetupRoutes(): void {

    this.app.get("/", (req: Request, res: Response) => {
      res.status(200).json({"message": "hello"})
    })  

    this.app.use("/api/auth/", this.authController.router)

  }
}