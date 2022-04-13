const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

const canvasHold = document.getElementById('hold');
const ctxHold = canvasHold.getContext('2d');


const audioElement = document.querySelector('audio');
const playButton = document.querySelector('.music-button');

let playerStatus = {
  score: 0,
  level: 0,
  lines: 0
};

function updatePlayer(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

let player = new Proxy(playerStatus, {
  set: (target, key, value) => {
    target[key] = value;
    updatePlayer(key, value);
    return true;
  }
});

moves = {
  [keys.LEFT]:   (p) => ({ ...p, x: p.x - 1 }),
  [keys.RIGHT]:  (p) => ({ ...p, x: p.x + 1 }),
  [keys.DOWN]:   (p) => ({ ...p, y: p.y + 1 }),
  [keys.SPACE]:  (p) => ({ ...p, y: p.y + 1 }),
  [keys.UP]:     (p) => place.rotate(p, rotation.RIGHT),
  [keys.Q]:      (p) => place.rotate(p, rotation.LEFT),
  [keys.C]:      (p) => place.hold()
};

let place = new Place(ctx, ctxNext, ctxHold);

initSidePanel(ctxNext);
initSidePanel(ctxHold);

function initSidePanel(ctx) {
  ctx.canvas.width = 4 * blockSize;
  ctx.canvas.height = 4 * blockSize;
  ctx.scale(blockSize, blockSize);
}

function addEventListener() {
  document.removeEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
  if (event.keyCode === keys.P) {
    audioElement.pause();
    pause();
  }
  if (event.keyCode === keys.ESC) {
    audioElement.pause();
    audioElement.currrentTime = 0;
    end.play();
    gameOver();
  } else if (moves[event.keyCode]) {
    event.preventDefault();
    let p = moves[event.keyCode](place.piece);
    if (event.keyCode === keys.SPACE) {
      while (place.valid(p)) {
        player.score += points.HARD_DROP;
        place.piece.move(p);
        p = moves[keys.DOWN](place.piece);
      }
      place.piece.hardDrop();
    } else if (place.valid(p)) {
      place.piece.move(p);
      if (event.keyCode === keys.DOWN) {
        player.score += points.SOFT_DROP;
      }
    } else
      fall.play();
  }
}

function resetGame() {
  player.score = 0;
  player.lines = 0;
  player.level = 0;
  place.reset();
  time = { start: performance.now(), elapsed: 0, level: level[player.level] };
}

let requestId = null;
let time = null;

function play() {
  ctx.paused = false;
  addEventListener();

  playButton.dataset.playing = 'true';
  audioElement.play();
  resetGame();

  if (requestId) {
    cancelAnimationFrame(requestId);
  }
  animate();
}

function animate(now = 0) {
  time.elapsed = now - time.start;
  if (time.elapsed > time.level) {
    time.start = now;
    if (!place.drop()) {
      audioElement.pause();
      audioElement.currentTime = 0;
      gameOver();
      return;
    }
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  place.draw();
  requestId = requestAnimationFrame(animate);
}

function gameOver() {
  cancelAnimationFrame(requestId);
  requestId = null;
  ctx.fillStyle = 'white';
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = '1px Futura';
  ctx.fillStyle = 'red';
  ctx.fillText('GAME OVER', 1.8, 4);
}

function pause() {
  if (!requestId) {
    ctx.paused = true;
    countdown();
  }

  cancelAnimationFrame(requestId);
  requestId = null;

  ctx.fillStyle = 'White';
  ctx.fillRect(1, 3, 7, 1.2);
  ctx.font = '1px Futura';
  ctx.fillStyle = 'blue';
  ctx.fillText('  PAUSE', 3, 4);
  ctx.paused = true;
}

function countdown(e) {
  if (requestId) {
    audioElement.pause();
    pause();
  } else {
    let isPaused = ctx.paused;
    if (!isPaused) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      audioElement.currentTime = 0;
    }
    let count = 3;
    document.getElementById('timer').innerHTML = count;
    let counter = setInterval(countdown, 1000);
    function countdown() {
      count -= 1;
      document.getElementById('timer').innerHTML = count;
      if (count <= 0) {
        clearInterval(counter);
        if (!isPaused) {
          play();
        } else {
          ctx.paused = false;
          document.getElementById("timer").innerHTML = '';
          audioElement.play();
          animate();
          return;
        }
        document.getElementById("timer").innerHTML = '';
        return;
      }
    }
  }
}