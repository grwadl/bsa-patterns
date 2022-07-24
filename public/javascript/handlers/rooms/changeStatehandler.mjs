import { changeReadyStatus, setProgress } from "../../views/user.mjs";

export const changeStateHandler = ({ username, isReady, percent }) => {
  changeReadyStatus({ username, ready: isReady });
  setProgress({ username, progress: percent });
};
