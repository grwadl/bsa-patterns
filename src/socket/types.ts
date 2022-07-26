export interface IMember {
  username: string;
  isReady: boolean;
  percent: number;
  id: string;
  seconds: number;
}

export interface IRoom {
  name: string;
  members: IMember[];
  winners?: IMember[];
  inGame: boolean;
  chosedId: number | boolean;
  isHidden: boolean;
}
