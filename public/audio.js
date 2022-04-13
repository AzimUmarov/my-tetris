const clear = new Audio('./audio/clear.wav');
const rotate = new Audio('./audio/rotate.wav');
const end = new Audio('./audio/end.wav');
const gameover = new Audio('./audio/gameover.wav');
const fall = new Audio('./audio/fall.wav');
const line = new Audio('./audio/success.wav');
const move = new Audio('./audio/move.wav');

(function addBackgroundMusicEventListener() {
  const audioElement = document.querySelector('audio');
  const playButton = document.querySelector('.music-button');
  playButton.addEventListener('click', function() {
    if (playButton.dataset.playing === 'false') {
      playButton.dataset.playing = 'true';
      audioElement.play();
    } else {
      audioElement.pause();
      playButton.dataset.playing = 'false';
    }
  })
})();
