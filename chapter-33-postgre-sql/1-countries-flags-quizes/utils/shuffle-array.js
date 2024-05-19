module.exports.shuffleArray = arr => {
  const shuffled = [...arr];
  for (let i = 0; i < arr.length; i++) {
    const randomIdx = Math.floor(Math.random() * arr.length);
    [shuffled[i], shuffled[randomIdx]] = [shuffled[randomIdx], shuffled[i]];
  }
  return shuffled;
}