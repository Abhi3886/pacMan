export function generateTileMap(boardDimensions, minGhostDistance = 3) {
  const [rows, cols] = boardDimensions;

  const WALL = "x";
  const FOOD = ".";
  const PACMAN = "1";
  const GHOSTS = ["p", "b", "y"];

  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.25 ? WALL : FOOD))
  );

  const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

  const ghostPositions = [];

  for (const ghost of GHOSTS) {
    let placed = false;

    while (!placed) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      if (board[r][c] === FOOD) {
        board[r][c] = ghost;
        ghostPositions.push([r, c]);
        placed = true;
      }
    }
  }

  const farFromGhosts = (r, c) =>
    ghostPositions.every(
      ([gr, gc]) => Math.abs(gr - r) + Math.abs(gc - c) >= minGhostDistance
    );

  const notBoxedByWalls = (r, c) => {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    return directions.some(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return inBounds(nr, nc) && board[nr][nc] !== WALL;
    });
  };

  const validSpawns = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (
        board[r][c] === FOOD &&
        farFromGhosts(r, c) &&
        notBoxedByWalls(r, c)
      ) {
        validSpawns.push([r, c]);
      }
    }
  }

  const [pr, pc] =
    validSpawns.length > 0
      ? validSpawns[Math.floor(Math.random() * validSpawns.length)]
      : [0, 0];

  board[pr][pc] = PACMAN;

  return board.map((row) => row.join(""));
}
