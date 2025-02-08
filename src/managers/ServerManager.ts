import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { DBService } from "../services/DBService"
import { HttpExpressService } from "../services/HttpExpressService"
import { SocketService } from "../services/SocketService"

export class ServerManager {
  private app: express.Application
  private httpServer: ReturnType<typeof createServer>
  private io: Server

  private PORT: number = 8000;

  private dbService: DBService
  private httpExpressService: HttpExpressService
  private socketService: SocketService

  constructor() {
    
    this.app = express();

    this.httpServer = createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: "*"
      }
    })

    this.dbService = DBService.GetInstance();
  
    this.httpExpressService = new HttpExpressService(this.app)

    this.socketService = new SocketService(this.io, this.dbService)

    this.httpServer.listen(this.PORT, () => {
      console.log(`Server is listening on port: ${this.PORT}`)
    })

  }
}