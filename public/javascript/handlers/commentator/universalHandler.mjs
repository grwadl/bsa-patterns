const arrayEvents = [
  "greet_me",
  "greet_other",
  "comment_counter",
  "someone_finished",
  "send_joke",
  "send_progress",
  "send_player_list",
  "user_close",
  "other_close",
  "comment_winners",
  "comment_change_status",
  "comment_leave_room",
];

const changeComment = (text) => {
  const commentatorWrapper = document.querySelector(".commentator__text");
  commentatorWrapper.classList.add("animated");
  commentatorWrapper.innerText = text;
  setTimeout(() => commentatorWrapper.classList.remove("animated"), 1000);
};

export const universalhandler = (eventName, payload) => {
  arrayEvents.includes(eventName) ? changeComment(payload) : null;
};
