export function generateTileMap(boardSize) {
  const [rows, cols] = boardSize;

  // 1. Create empty grid
  const map = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => " ")
  );

  // 2. Hard wall border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) {
        map[r][c] = "x";
      }
    }
  }

  // 3. Organic interior walls (biased randomness)
  const wallChance = 0.25;

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      // Avoid tight 2x2 wall blocks (feels artificial)
      const neighbors =
        (map[r - 1][c] === "x") +
        (map[r + 1][c] === "x") +
        (map[r][c - 1] === "x") +
        (map[r][c + 1] === "x");

      if (Math.random() < wallChance && neighbors < 3) {
        map[r][c] = "x";
      }
    }
  }

  // 4. Find seed for flood-fill
  let seed = null;
  for (let r = 1; r < rows - 1 && !seed; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (map[r][c] !== "x") {
        seed = [r, c];
        break;
      }
    }
  }

  // 5. Flood-fill reachable area
  const reachable = new Set();
  const queue = [seed];
  const key = (r, c) => `${r},${c}`;

  reachable.add(key(seed[0], seed[1]));

  while (queue.length) {
    const [r, c] = queue.shift();

    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr > 0 &&
        nr < rows - 1 &&
        nc > 0 &&
        nc < cols - 1 &&
        map[nr][nc] !== "x"
      ) {
        const k = key(nr, nc);
        if (!reachable.has(k)) {
          reachable.add(k);
          queue.push([nr, nc]);
        }
      }
    }
  }

  // 6. Remove unreachable spaces
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (map[r][c] !== "x" && !reachable.has(key(r, c))) {
        map[r][c] = "x";
      }
    }
  }

  // 7. Collect reachable empty tiles
  const emptyTiles = [];
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (map[r][c] === " ") {
        emptyTiles.push([r, c]);
      }
    }
  }

  // 8. Place Pac-Man
  const pacIdx = Math.floor(Math.random() * emptyTiles.length);
  const [pr, pc] = emptyTiles.splice(pacIdx, 1)[0];
  map[pr][pc] = "1";

  // 9. Place ghosts
  const ghosts = ["b", "p", "y"];
  for (const g of ghosts) {
    const idx = Math.floor(Math.random() * emptyTiles.length);
    const [r, c] = emptyTiles.splice(idx, 1)[0];
    map[r][c] = g;
  }

  // 10. Place food everywhere else
  for (const [r, c] of emptyTiles) {
    map[r][c] = ".";
  }

  return map;
}
