import { Request, Response, Router } from "express";
import { DBService } from "../services/DBService";

export class AuthController {

  private dbService: DBService
  public router: Router

  constructor(dbService: DBService) {
    this.dbService = dbService;
    this.router = Router();

    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post("/login", this.login);
    this.router.post("/register", this.register);
  }

  private async login(req: Request, res: Response) {
    try {

      const { email, password } = req.body;

    } catch (error) {
      console.log("Server Error")
    }

  }

  private async register(req: Request, res: Response) {

  }
}