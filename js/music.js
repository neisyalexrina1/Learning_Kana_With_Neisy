const musicList = [
  "music/Down In The Shade.mp3",
  "music/First Snow.mp3",
  "music/Remembrance.mp3",
  "music/Sirius's Heart.mp3",
  "music/To The End of The Journey of Shining Stars.mp3",
  "music/Addressing Stars.mp3",
  "music/Linne.mp3",
];

function getRandomMusic() {
  const index = Math.floor(Math.random() * musicList.length);
  return musicList[index];
}
