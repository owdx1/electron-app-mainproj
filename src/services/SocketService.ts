import { Server } from "socket.io";
import { DBService } from "./DBService";
import { User } from "@prisma/client";

export class SocketService {

  private io: Server
  private dbService: DBService
  
  private socketUserMap: Map<string, string>;


  constructor(io: Server, dbService: DBService) {

    this.io = io;
    this.dbService = dbService;
    
    this.socketUserMap = new Map();
    this.setupSocketChannels();

  }

  private SendMessage(socketId: string, message: string) {
    this.io.to(socketId).emit('server-message', message);
  }


  private setupSocketChannels() {

    if(!this.io) {
      throw new Error("Couldn't find IO")
    }

    this.io.on('connect', (socket) => {
      console.log("Socket is open: ", socket.id)

      socket.on('authenticate', async(userid: string) => {
        const currentUserId = this.socketUserMap.get(socket.id);

        if(currentUserId != undefined) {
          this.SendMessage(socket.id, "User is already connected.")
          return
        }

        const user: User | null | undefined = await this.dbService.GetUserByUserId(userid);

        if(user === null || user === undefined) {
          return this.SendMessage(socket.id, "Such user is not found")
        }

        this.socketUserMap.set(socket.id, userid);
        this.SendMessage(socket.id, "Connected to server!");

      })

      socket.on('disconnect', () => {
        console.log("Socket is off:", socket.id);
        this.socketUserMap.delete(socket.id);

      })
    })

  }
}