class Place {
  constructor(ctx, ctxNext, ctxHold) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.ctxHold = ctxHold;
    this.init();
  }

  init() {
    this.ctx.canvas.width = columns * blockSize;
    this.ctx.canvas.height = rows * blockSize;
    this.ctx.scale(blockSize, blockSize);
  }

  clearHold() {
    const { width, height } = this.ctxHold.canvas;
    this.ctxHold.clearRect(0, 0, width, height);
    this.ctxHold.piece = false;
  }

  reset() {
    this.grid = this.getEmptyGrid();
    this.clearHold();
    this.piece = new Piece(this.ctx);
    this.piece.setStartingPosition();
    this.getNewPiece();
  }

  getNewPiece() {
    const { width, height } = this.ctxNext.canvas;
    this.next = new Piece(this.ctxNext);
    this.ctxNext.clearRect(0, 0, width, height);
    this.next.draw();
  }

  draw() {
    this.piece.draw();
    this.drawBoard();
  }

  drop() {
    let p = moves[keys.DOWN](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        gameover.play();
        return false;
      }
      fall.play();
      this.piece = this.next;
      this.piece.ctx = this.ctx;
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
    return true;
  }

  clearLines() {
    let lines = 0;

    this.grid.forEach((row, y) => {
      if (row.every((value) => value > 0)) {
        lines++;

        this.grid.splice(y, 1);
        clear.play();
        // Add zero filled row at the top.
        this.grid.unshift(Array(columns).fill(0));
      }
    });

    if (lines > 0) {
      player.score += this.getLinesClearedPoints(lines);
      player.lines += lines;

      if (player.lines >= linesLevel) {
        player.level++;
        player.lines -= linesLevel;
        time.level = level[player.level];
      }
    }
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return value === 0 || (this.isInsideWalls(x, y) && this.notOccupied(x, y));
      });
    });
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = colors[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  getEmptyGrid() {
    return Array.from({ length: rows }, () => Array(columns).fill(0));
  }

  isInsideWalls(x, y) {
    return x >= 0 && x < columns && y <= rows;
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  rotate(piece, direction) {
    let p = JSON.parse(JSON.stringify(piece));
    if (!piece.hardDropped) {
      for (let y = 0; y < p.shape.length; y++)
        for (let x = 0; x < y; x++)
          [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      if (direction === rotation.RIGHT) {
        p.shape.forEach((row) => row.reverse());
        rotate.play();
      } else if (direction === rotation.LEFT) {
        p.shape.reverse();
        rotate.play();
      }
    }
    return p;
  }

  swapPieces() {
    if (!this.ctxHold.piece) {
      this.ctxHold.piece = this.piece;
      this.piece = this.next;
      this.getNewPiece();
    } else {
      let temp = this.piece
      this.piece = this.ctxHold.piece;
      this.ctxHold.piece = temp;
    }
    this.ctxHold.piece.ctx = this.ctxHold;
    this.piece.ctx = this.ctx;
    this.piece.setStartingPosition();
    this.hold = this.ctxHold.piece;
    const { width, height } = this.ctxHold.canvas;
    this.ctxHold.clearRect(0, 0, width, height);
    this.ctxHold.piece.x = 0;
    this.ctxHold.piece.y = 0;
    this.ctxHold.piece.draw();
  }

  hold() {
    if (this.piece.swapped)
      return;
    this.swapPieces();
    this.piece.swapped = true;
    return this.piece;
  }

  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1
        ? points.SINGLE
        : lines === 2
        ? points.DOUBLE
        : lines === 3
        ? points.TRIPLE
        : lines === 4
        ? points.TETRIS
        : 0;

    return (player.level + 1) * lineClearPoints;
  }
}