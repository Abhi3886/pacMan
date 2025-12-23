import { useState, useRef, useEffect } from "react";
import "./index.css";

import { loadAllImages } from "./controllers/loadImage";

import { generateTileMap } from "./controllers/generateTileMap";
import Block from "./controllers/blockClass";
import { use } from "react";

function App() {
  const boardRef = useRef(null);

  const [boardSize, setBoardSize] = useState([15, 17]);
  const [level, setLevel] = useState(1);
  const [retry, setRetry] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const score = useRef(0);
  const gameOverRef = useRef(false);
  const isWinner = useRef(false);
  const tileSize = 32;

  const boardDimensions = {
    width: boardSize[1] * tileSize,
    height: boardSize[0] * tileSize,
  };

  const walls = useRef(new Set());
  const foods = useRef(new Set());
  const ghosts = useRef(new Set());
  const pacMan = useRef(null);
  const loopRef = useRef(null);
  const imagesRef = useRef(null);

  function clearGame() {
    setIsGameOver(false);
    setIsGameWon(false);
    score.current = 0;
    setCurrentScore(0);
    gameOverRef.current = false;
    isWinner.current = false;
  }

  const handleRetry = () => {
    clearGame();
    setRetry((r) => r + 1);
  };

  function saveLevel(level, tileMap) {
    localStorage.setItem(`pacman-level-${level}`, JSON.stringify(tileMap));
  }

  function loadLevel(level) {
    const data = localStorage.getItem(`pacman-level-${level}`);
    return data ? JSON.parse(data) : null;
  }

  function loadMap(
    tileMap,
    walls,
    foods,
    ghosts,
    pacMan,
    boardSize,
    tileSize,
    images
  ) {
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
          walls.add(
            new Block(images.pacManWall, x, y, char, tileSize, tileSize)
          );
        } else if (char === "b") {
          ghosts.add(
            new Block(images.ghostBlue, x, y, char, tileSize, tileSize)
          );
        } else if (char === "p") {
          ghosts.add(
            new Block(images.ghostPink, x, y, char, tileSize, tileSize)
          );
        } else if (char === "y") {
          ghosts.add(
            new Block(images.ghostYellow, x, y, char, tileSize, tileSize)
          );
        } else if (char === "1") {
          pacMan.current = new Block(
            images.pacManRight,
            x,
            y,
            char,
            tileSize,
            tileSize
          );
        } else if (char === ".") {
          foods.add(new Block(null, x, y, char, tileSize, tileSize));
        }
      }
    }
  }

  function handlerForGameOver() {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setIsGameOver(true);
    clearInterval(loopRef.current);
  }

  function movePacMan(e, pacMan, imagesRef) {
    if (gameOverRef.current) return;
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

  function moveGhosts(ghosts, walls) {
    if (gameOverRef.current) return;

    const direction = ["U", "D", "L", "R"];
    ghosts.forEach((ghost) => {
      const randomDirection = direction[Math.floor(Math.random() * 4)];

      console.log(ghost.x, ghost.y, "old position");
      ghost.updateDirection(randomDirection);

      ghost.x += ghost.velocityX;
      ghost.y += ghost.velocityY;
      console.log(ghost.x, ghost.y, "new position");

      ghost.checkBoundary(boardDimensions);

      walls.forEach((wall) => {
        if (ghost.isColliding(wall)) {
          ghost.x -= ghost.velocityX;
          ghost.y -= ghost.velocityY;
        }
      });
    });
  }

  function draw(walls, foods, ghosts, pacMan, boardDimensions) {
    const ctx = boardRef.current.getContext("2d");
    ctx.clearRect(0, 0, boardDimensions.width, boardDimensions.height);
    pacMan.drawBlock(ctx);
    ghosts.forEach((ghost) => ghost.drawBlock(ctx, "ghost"));
    walls.forEach((wall) => wall.drawBlock(ctx));
    foods.forEach((food) => food.drawBlock(ctx, [...ghosts, pacMan]));
  }

  function move(pacMan, walls, ghosts, foods) {
    if (gameOverRef.current) return;
    pacMan.x += pacMan.velocityX;
    pacMan.y += pacMan.velocityY;

    pacMan.checkBoundary(boardDimensions);

    for (let wall of walls.values()) {
      if (pacMan.isColliding(wall)) {
        pacMan.x -= pacMan.velocityX;
        pacMan.y -= pacMan.velocityY;
        break;
      }
    }

    for (let ghost of ghosts.values()) {
      if (pacMan.isColliding(ghost)) {
        handlerForGameOver();
        return;
      }
    }

    if (foods.size !== 0) {
      for (let food of foods.values()) {
        if (pacMan.isColliding(food)) {
          // console.log("remove the food from that position and update the canva");
          foods.delete(food);
          score.current++;
          setCurrentScore(score.current);
          break;
        }
      }
    } else {
      isWinner.current = true;
      setIsGameWon(true);
      handlerForGameOver();
    }
  }

  function update(walls, foods, ghosts, pacMan, boardDimensions) {
    if (gameOverRef.current) return;
    moveGhosts(ghosts, walls);
    move(pacMan, walls, ghosts, foods);
    draw(walls, foods, ghosts, pacMan, boardDimensions);

    loopRef.current = setTimeout(
      () => update(walls, foods, ghosts, pacMan, boardDimensions),
      300
    );
  }

  useEffect(() => {
    let mounted = true;

    function handleKeyboard(e) {
      if (gameOverRef.current) return;
      if (!pacMan.current) return;
      movePacMan(e, pacMan.current, imagesRef.current);
    }

    async function init() {
      try {
        imagesRef.current = await loadAllImages();
        if (!mounted) return;

        let tileMap = loadLevel(level);

        if (!tileMap) {
          tileMap = generateTileMap(boardSize);
          saveLevel(level, tileMap);
        }

        loadMap(
          tileMap,
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
          boardDimensions
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
  }, [level, retry]);

  const handleNextLevel = () => {
    setLevel((l) => l + 1);
    setBoardSize(([r, c]) => [r + 2, c + 2]);
    clearGame();
  };

  return (
    <div className="flex flex-col h-screen items-center">
      {isGameOver && (
        <div className=" flex ">
          {isGameWon ? (
            <div className="text-lg text-green-500">Winner</div>
          ) : (
            <div className="text-lg text-red-500">Loser</div>
          )}
        </div>
      )}
      <canvas
        ref={boardRef}
        width={boardDimensions.width}
        height={boardDimensions.height}
        className="bg-black mt-6"
      />
      <div className="flex gap-2  ">
        <button onClick={handleRetry} className="bg-pink-300 px-4 py-2 mt-4">
          Retry
        </button>
        <button
          onClick={handleNextLevel}
          className="bg-pink-300 px-4 py-2 mt-4"
        >
          Next Level
        </button>

        <div className="bg-pink-300 px-4 py-2 mt-4 text-white rounded font-bold font-cation">
          score:{" " + currentScore}
        </div>
      </div>
    </div>
  );
}

export default App;
