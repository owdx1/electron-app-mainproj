import { PrismaClient, User } from "@prisma/client";

export class DBService {

  private static instance: DBService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient();
  }


  public static GetInstance() {
    if(!DBService.instance) {

      DBService.instance = new DBService();

    }

    return DBService.instance;
  }

  public GetUserByUserId(userid: string) {
    try {

      const user = this.prisma.user.findFirst({
        where: {
          id: userid
        }
      })

      if(!user) { 
        return null
      }

      return user;

    } catch (error) {
      console.error("Error: ",  error)
    }
  }
  
  public GetUserByUserEmail(email: string) {
    try {

      const user = this.prisma.user.findFirst({
        where: {
          email
        }
      })

      if(!user) { 
        return null
      }

      return user;

    } catch (error) {
      console.error("Error: ",  error)
    }
  }
}
