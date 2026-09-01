// Kid-friendly positive reinforcement. Short, upbeat, all-ages words shown on
// good moves and line clears to keep the game encouraging and addictive.

const PLACE_PRAISE = ['Nice!', 'Good one!', 'Yes!', 'Cool!', 'Great!', 'Sweet!'];

const CLEAR_PRAISE = ['Awesome!', 'Boom!', 'Wow!', 'Amazing!', 'Fantastic!', 'Superb!'];

const COMBO_PRAISE = [
  'On Fire!',
  'Unstoppable!',
  'Superstar!',
  'Incredible!',
  'Legendary!',
  'Champion!',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function placePraise() {
  return pick(PLACE_PRAISE);
}

export function clearPraise(streak = 1) {
  if (streak >= 3) return pick(COMBO_PRAISE);
  return pick(CLEAR_PRAISE);
}
