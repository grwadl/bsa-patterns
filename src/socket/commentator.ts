import { Server } from "socket.io";
import { IRoom } from "./types";
import { greetings, msgBeforeGame, msgResults } from "./texts";
import _ from "lodash";
import { msgWhenFinished } from "./texts";
import { IMember } from "./types";

export interface IGreeting {
  toUser: string;
  toOther: string;
}
const GREETINGS_COUNT: number = 2;
const randomGenerate = (max: number, min: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

export class Commentator {
  io: Server;
  room: IRoom;
  constructor(io: Server, room: IRoom) {
    this.io = io;
    this.room = room;
  }

  public sendGreeting(id: string, userName: string): void {
    const { toUser, toOther } = TextGenerator.sendGreeting(userName);
    this.io.to(id).emit("greet_me", toUser);
    this.io.sockets.in(this.room.name).except(id).emit("greet_other", toOther);
  }

  public sendMessageBeforeGame(id: string): void {
    const message: string = TextGenerator.messageBeforeGame();
    this.io.to(id).emit("comment_counter", message);
  }

  public sendMessageWhenFinished(userName: string): void {
    const message: string = TextGenerator.messageWhenFinished(userName);
    this.io.sockets.in(this.room.name).emit("someone_finished", message);
  }

  public sendResultMessage(id: string, winners: IMember[]): void {
    winners.length = winners.length > 3 ? 3 : winners.length;
    const message: string = TextGenerator.sendMessageWhenGameOver(winners);
    this.io.to(id).emit("comment_winners", message);
  }
}

export const generateGreeting = (username: string, index: number): string => {
  return greetings[index]?.toOther + username;
};

const curriedOtherGreeting = _.curry(generateGreeting);

export class TextGenerator {
  static sendGreeting(userName: string): IGreeting {
    const rndInt: number = randomGenerate(GREETINGS_COUNT, 0);
    return {
      ...greetings[rndInt],
      toOther: curriedOtherGreeting(userName)(rndInt),
    };
  }
  static messageBeforeGame(): string {
    return msgBeforeGame;
  }

  static messageWhenFinished(userName: string): string {
    return msgWhenFinished
      .split(" ")
      .map((item: string) => (item === "name" ? userName : item))
      .join(" ");
  }
  static sendMessageWhenGameOver(winners: IMember[]): string {
    return msgResults + winners.map((item: IMember) => item.username).join(" ");
  }
}
