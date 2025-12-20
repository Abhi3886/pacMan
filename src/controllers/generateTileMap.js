export function generateTileMap(boardDimensions, minGhostDistance = 3) {
  const [rows, cols] = boardDimensions;

  const WALL = "x";
  const FOOD = ".";
  const EMPTY = " ";
  const PACMAN = "1";
  const GHOSTS = ["p", "b", "y"];

  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.25 ? WALL : FOOD))
  );

  const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  /* ---------------- Flood fill to find accessible tiles ---------------- */

  const floodFill = (sr, sc) => {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    const queue = [[sr, sc]];
    visited[sr][sc] = true;

    while (queue.length) {
      const [r, c] = queue.shift();

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (inBounds(nr, nc) && !visited[nr][nc] && board[nr][nc] !== WALL) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return visited;
  };

  /* ---------------- Pick a random walkable seed ---------------- */

  let seed = null;
  for (let r = 0; r < rows && !seed; r++) {
    for (let c = 0; c < cols && !seed; c++) {
      if (board[r][c] !== WALL) seed = [r, c];
    }
  }

  if (!seed) return board.map((row) => row.join(""));

  const reachable = floodFill(seed[0], seed[1]);

  /* ---------------- Remove inaccessible food ---------------- */

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === FOOD && !reachable[r][c]) {
        board[r][c] = EMPTY;
      }
    }
  }

  /* ---------------- Place ghosts (reachable only) ---------------- */

  const ghostPositions = [];

  for (const ghost of GHOSTS) {
    let placed = false;

    while (!placed) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      if (reachable[r][c] && (board[r][c] === FOOD || board[r][c] === EMPTY)) {
        board[r][c] = ghost;
        ghostPositions.push([r, c]);
        placed = true;
      }
    }
  }

  /* ---------------- Pac-Man spawn logic ---------------- */

  const farFromGhosts = (r, c) =>
    ghostPositions.every(
      ([gr, gc]) => Math.abs(gr - r) + Math.abs(gc - c) >= minGhostDistance
    );

  const validSpawns = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (
        reachable[r][c] &&
        (board[r][c] === FOOD || board[r][c] === EMPTY) &&
        farFromGhosts(r, c)
      ) {
        validSpawns.push([r, c]);
      }
    }
  }

  const [pr, pc] =
    validSpawns.length > 0
      ? validSpawns[Math.floor(Math.random() * validSpawns.length)]
      : seed;

  board[pr][pc] = PACMAN;

  return board.map((row) => row.join(""));
}
