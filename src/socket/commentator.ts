import { Server } from "socket.io";
import { IRoom } from "./types";
import { greetings, msgBeforeGame, msgResults } from "./texts";
import _ from "lodash";
import { msgWhenFinished } from "./texts";
import { IMember } from "./types";

enum Actions {
  greetMe = "greet_me",
  greetOther = "greet_other",
  beforeGameCounter = "comment_counter",
  userFinished = "someone_finished",
  sendWinners = "comment_winners",
}
export interface IGreeting {
  toUser: string;
  toOther: string;
}
interface IdProps {
  id: string;
  actionName: Actions;
  payload: any;
}

const MAX_GREETINGS_COUNT: number = 2;
const MIN_GREETINGS_COUNT: number = 0;

class AbstractSender {
  io: Server;
  room: IRoom;
  constructor(io: Server, room: IRoom) {
    this.io = io;
    this.room = room;
  }
  public broadCastRoom(actionName: Actions, payload: any): void {
    this.io.sockets.to(this.room.name).emit(actionName, payload);
  }
  public emitToId({ id, actionName, payload }: IdProps): void {
    this.io.to(id).emit(actionName, payload);
  }
  public emitInRoom(actionName: Actions, payload: any): void {
    this.io.sockets.in(this.room.name).emit(actionName, payload);
  }
}

export class Commentator extends AbstractSender {
  constructor(io: Server, room: IRoom) {
    super(io, room);
  }

  public sendGreeting(id: string, userName: string): void {
    const { toUser, toOther } = TextGenerator.sendGreeting(userName);
    super.emitToId({ id, actionName: Actions.greetMe, payload: toUser });
    super.broadCastRoom(Actions.greetOther, toOther);
  }

  public sendMessageBeforeGame(id: string): void {
    const message: string = TextGenerator.messageBeforeGame();
    super.emitToId({
      id,
      actionName: Actions.beforeGameCounter,
      payload: message,
    });
  }

  public sendMessageWhenFinished(userName: string): void {
    const message: string = TextGenerator.messageWhenFinished(userName);
    super.emitInRoom(Actions.userFinished, message);
  }

  public sendResultMessage(id: string, winners: IMember[]): void {
    winners.length = winners.length > 3 ? 3 : winners.length;
    const message: string = TextGenerator.sendMessageWhenGameOver(winners);
    super.emitToId({ id, actionName: Actions.sendWinners, payload: message });
  }
}
export class TextGenerator {
  static sendGreeting(userName: string): IGreeting {
    const rndInt: number = randomGenerate(
      MAX_GREETINGS_COUNT,
      MIN_GREETINGS_COUNT
    );
    return {
      ...greetings[rndInt],
      toOther: curriedOtherGreeting(userName)(rndInt),
    };
  }
  static messageBeforeGame(): string {
    return msgBeforeGame;
  }

  static messageWhenFinished(userName: string): string {
    return generateFinishedMessage(msgBeforeGame, userName);
  }
  static sendMessageWhenGameOver(winners: IMember[]): string {
    return curriedGenerateGameOverText(winners)(msgResults);
  }
}

export const generateGreeting = (username: string, index: number): string => {
  return greetings[index]?.toOther + username;
};
const curriedOtherGreeting = _.curry(generateGreeting);
const randomGenerate = (max: number, min: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const generateFinishedMessage = (msg: string, userName: string): string => {
  return msgWhenFinished
    .split(" ")
    .map((item: string) => (item === "name" ? userName : item))
    .join(" ");
};
const generateGameOverText = (winners: IMember[], msg: string): string => {
  return msg + winners.map((item: IMember) => item.username).join(" ");
};
const curriedGenerateGameOverText = _.curry(generateGameOverText);
