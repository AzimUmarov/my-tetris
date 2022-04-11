const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

const canvasHold = document.getElementById('hold');
const ctxHold = canvasHold.getContext('2d');


const audioElement = document.querySelector('audio');
const playButton = document.querySelector('.music-button');

let accountValues = {
  score: 0,
  level: 0,
  lines: 0
};

function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

let account = new Proxy(accountValues, {
  set: (target, key, value) => {
    target[key] = value;
    updateAccount(key, value);
    return true;
  }
});

moves = {
  [KEY.LEFT]:   (p) => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]:  (p) => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]:   (p) => ({ ...p, y: p.y + 1 }),
  [KEY.SPACE]:  (p) => ({ ...p, y: p.y + 1 }),
  [KEY.UP]:     (p) => board.rotate(p, ROTATION.RIGHT),
  [KEY.Q]:      (p) => board.rotate(p, ROTATION.LEFT),
  [KEY.C]:      (p) => board.swap()
};

let board = new Board(ctx, ctxNext, ctxHold);

initSidePanel(ctxNext);
initSidePanel(ctxHold);

function initSidePanel(ctx) {
  ctx.canvas.width = 4 * BLOCK_SIZE;
  ctx.canvas.height = 4 * BLOCK_SIZE;
  ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function addEventListener() {
  document.removeEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
  if (event.keyCode === KEY.P) {
    audioElement.pause();
    pause();
  }
  if (event.keyCode === KEY.ESC) {
    audioElement.pause();
    audioElement.currrentTime = 0;
    end.play();
    gameOver();
  } else if (moves[event.keyCode]) {
    event.preventDefault();
    let p = moves[event.keyCode](board.piece);
    if (event.keyCode === KEY.SPACE) {
      while (board.valid(p)) {
        account.score += POINTS.HARD_DROP;
        board.piece.move(p);
        p = moves[KEY.DOWN](board.piece);
      }
      board.piece.hardDrop();
    } else if (board.valid(p)) {
      board.piece.move(p);
      if (event.keyCode === KEY.DOWN) {
        account.score += POINTS.SOFT_DROP;
      }
    } else
      fall.play();
  }
}

function resetGame() {
  account.score = 0;
  account.lines = 0;
  account.level = 0;
  board.reset();
  time = { start: performance.now(), elapsed: 0, level: LEVEL[account.level] };
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
    if (!board.drop()) {
      audioElement.pause();
      audioElement.currentTime = 0;
      gameOver();
      return;
    }
  }

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  board.draw();
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