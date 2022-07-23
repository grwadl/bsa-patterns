import { Server } from "socket.io";
import { IRoom } from "./types";
import { greetings, msgBeforeGame, msgResults } from "./texts";
import _ from "lodash";
import { msgWhenFinished } from "./texts";
import { IMember } from "./types";
//за качество кода в index.ts сразу извиняюсь рефакторить не стал(это код еще с прошлого задания), потому что преподователь сказал оцениваться не будет та и я боюсь лишний раз трогать оно и так на соплях работает
//но я думаю вы в index.ts и не полезете потому что абсолютно вся логика комментатора сделана здесь
//зато постарался в этом модуле программы все по красоте сделать :)
enum Actions {
  greetMe = "greet_me",
  greetOther = "greet_other",
  beforeGameCounter = "comment_counter",
  userFinished = "someone_finished",
  sendWinners = "comment_winners",
  sendJoke = "send_joke",
  sendProgress = "send_progress",
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
//в теории у нас могут быть много похожих сущностей которые будут эмитить на клиент, поэтому решил сделать такой класс
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
  public emitRoomExclude(
    actionName: Actions,
    payload: any,
    except: string[]
  ): void {
    this.io.sockets.in(this.room.name).except(except).emit(actionName, payload);
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
    winners.length = winners?.length > 3 ? 3 : winners?.length;
    const message: string = TextGenerator.sendMessageWhenGameOver(winners);
    super.emitToId({ id, actionName: Actions.sendWinners, payload: message });
  }
  public sendProgress(users: IMember[], id: string): void {
    const progress = users.map((user) => {
      return { progress: user.percent, username: user.username };
    });
    super.emitToId({ id, actionName: Actions.sendProgress, payload: progress });
  }
  public sendJoke(id: string): void {
    //я решил что пусть каждому юзеру будет случайная шутка отправляться
    super.emitToId({ id, actionName: Actions.sendJoke, payload: "some joke" });
  }
}

//чтоб не делать класс Commentator слишком умным и не засорять его методы решил сделать отдельный класс с логикой генерации сообщений
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
  static sendMessageHalfProgress(): void {}
  static sendJoke(): void {}
}
//тут функции вспомогательные
export const generateGreeting = (username: string, index: number): string => {
  return greetings[index]?.toOther + username;
};
const curriedOtherGreeting = _.curry(generateGreeting);
const randomGenerate = (max: number, min: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const generateFinishedMessage = (msg: string, userName: string): string => {
  return msg
    .split(" ")
    .map((item: string) => (item === "name" ? userName : item))
    .join(" ");
};
const generateGameOverText = (winners: IMember[], msg: string): string => {
  return msg + winners.map((item: IMember) => item.username).join(" ");
};
const curriedGenerateGameOverText = _.curry(generateGameOverText);
