import { useState, useRef, useEffect } from "react";
import "./index.css";

import { loadAllImages } from "./controllers/loadImage";

import { generateTileMap } from "./controllers/generateTileMap";
import Block from "./controllers/blockClass";

function App() {
  const boardRef = useRef(null);

  const [boardSize, setBoardSize] = useState([15, 17]);
  const [level, setLevel] = useState(1);
  const tileSize = 32;

  const boardStyle = {
    width: boardSize[1] * tileSize,
    height: boardSize[0] * tileSize,
  };

  const walls = useRef(new Set());
  const foods = useRef(new Set());
  const ghosts = useRef(new Set());
  const pacMan = useRef(null);
  const loopRef = useRef(null);
  const imagesRef = useRef(null);

  function loadMap(walls, foods, ghosts, pacMan, boardSize, tileSize, images) {
    const tileMap = generateTileMap(boardSize);

    walls.clear();
    foods.clear();
    ghosts.clear();
    pacMan.current = null;

    for (let r = 0; r < boardSize[0]; r++) {
      for (let c = 0; c < boardSize[1]; c++) {
        const char = tileMap[r][c];
        const x = c * tileSize;
        const y = r * tileSize;

        if (char === "x") {
          walls.add(new Block(images.pacManWall, x, y, tileSize, tileSize));
        } else if (char === "b") {
          ghosts.add(new Block(images.ghostBlue, x, y, tileSize, tileSize));
        } else if (char === "p") {
          ghosts.add(new Block(images.ghostPink, x, y, tileSize, tileSize));
        } else if (char === "y") {
          ghosts.add(new Block(images.ghostYellow, x, y, tileSize, tileSize));
        } else if (char === "1") {
          pacMan.current = new Block(
            images.pacManRight,
            x,
            y,
            tileSize,
            tileSize
          );
        } else if (char === ".") {
          foods.add(new Block(null, x, y, tileSize, tileSize));
        }
      }
    }
  }

  function draw(walls, foods, ghosts, pacMan, boardStyle) {
    const ctx = boardRef.current.getContext("2d");
    ctx.clearRect(0, 0, boardStyle.width, boardStyle.height);

    if (pacMan?.image) {
      ctx.drawImage(
        pacMan.image,
        pacMan.x,
        pacMan.y,
        pacMan.width,
        pacMan.height
      );
    }

    ghosts.forEach((g) => {
      if (g.image) {
        ctx.drawImage(g.image, g.x, g.y, g.width, g.height);
      }
    });

    walls.forEach((w) => {
      if (w.image) {
        ctx.drawImage(w.image, w.x, w.y, w.width, w.height);
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(w.x, w.y, w.width, w.height);
      }
    });

    ctx.fillStyle = "white";
    foods.forEach((f) => {
      const size = 5;
      const x = f.x + (f.width - size) / 2;
      const y = f.y + (f.height - size) / 2;

      ctx.fillRect(x, y, size, size);
    });
  }

  function movePacMan(e, pacMan, imagesRef) {
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      pacMan.updateDirection("U", imagesRef.pacManUp);
    } else if (e.code === "KeyS" || e.code === "ArrowDown") {
      pacMan.updateDirection("D", imagesRef.pacManDown);
    } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
      pacMan.updateDirection("L", imagesRef.pacManLeft);
    } else if (e.code === "KeyD" || e.code === "ArrowRight") {
      pacMan.updateDirection("R", imagesRef.pacManRight);
    }
  }

  function checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y + a.height > b.y &&
      a.y < b.y + b.height
    );
  }

  function move(pacMan, walls, ghosts, foods) {
    pacMan.x += pacMan.velocityX;
    pacMan.y += pacMan.velocityY;

    if (pacMan.x < 0) pacMan.x = 0;
    if (pacMan.x + pacMan.width > boardStyle.width)
      pacMan.x = boardStyle.width - pacMan.width;
    if (pacMan.y < 0) pacMan.y = 0;
    if (pacMan.y + pacMan.height > boardStyle.height)
      pacMan.y = boardStyle.height - pacMan.height;

    for (let wall of walls.values()) {
      if (checkCollision(pacMan, wall)) {
        pacMan.x -= pacMan.velocityX;
        pacMan.y -= pacMan.velocityY;
        break;
      }
    }

    for (let ghost of ghosts.values()) {
      if (checkCollision(pacMan, ghost)) {
        console.log("Game End");
        break;
      }
    }

    for (let food of foods.values()) {
      if (checkCollision(pacMan, food)) {
        console.log("remove the food from that position and update the canva");
        break;
      }
    }
  }

  function update(walls, foods, ghosts, pacMan, boardStyle) {
    move(pacMan, walls, ghosts, foods);
    draw(walls, foods, ghosts, pacMan, boardStyle);

    loopRef.current = setTimeout(
      () => update(walls, foods, ghosts, pacMan, boardStyle),
      50
    );
  }

  useEffect(() => {
    let mounted = true;

    function handleKeyboard(e) {
      if (!pacMan.current) return;
      movePacMan(e, pacMan.current, imagesRef.current);
    }

    async function init() {
      try {
        imagesRef.current = await loadAllImages();
        if (!mounted) return;

        loadMap(
          walls.current,
          foods.current,
          ghosts.current,
          pacMan,
          boardSize,
          tileSize,
          imagesRef.current
        );

        update(
          walls.current,
          foods.current,
          ghosts.current,
          pacMan.current,
          boardStyle
        );

        window.addEventListener("keydown", handleKeyboard);
      } catch (err) {
        console.error("Failed to load images:", err);
      }
    }

    init();

    return () => {
      mounted = false;
      clearTimeout(loopRef.current);
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [level]);

  // useEffect(() => {
  // }, []);

  const handleNextLevel = () => {
    setLevel((l) => l + 1);
    setBoardSize(([r, c]) => [r + 2, c + 2]);
  };

  return (
    <div className="flex flex-col h-screen items-center">
      <canvas
        ref={boardRef}
        width={boardStyle.width}
        height={boardStyle.height}
        className="bg-black mt-6"
      />
      <button onClick={handleNextLevel} className="bg-pink-300 px-4 py-2 mt-4">
        Next Level
      </button>
    </div>
  );
}

export default App;
