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
];

export const universalhandler = (eventName, payload) => {
  if (arrayEvents.includes(eventName)) {
    const commentatorWrapper = document.querySelector(".commentator__text");
    commentatorWrapper.innerText = payload;
  }
};
