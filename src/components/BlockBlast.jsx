import { useState, useEffect } from "react";
import "./BlockBlast.css";
import { translations } from "../translations.js";

const GRID_SIZE = 4;
const SHAPES = [
  [[1]], // 1x1
  [[1, 1]], // 1x2
  [[1], [1]], // 2x1
  [[1, 1, 1]], // 1x3
  [[1], [1], [1]], // 3x1
  [[1, 1], [1, 1]], // 2x2 square
  [[1, 1], [1, 0]], // L shape
  [[1, 0], [1, 1]], // reverse L
  [[1, 1, 1], [1, 0, 0]], // L 3x2
  [[1, 1, 1], [0, 0, 1]], // reverse L 3x2
];

function BlockBlast({ language = 'en' }) {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [gameShapes, setGameShapes] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);
  const [previewPos, setPreviewPos] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const t = translations[language];

  // Generate 3 random shapes
  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < 3; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      shapes.push({ id: i, shape: randomShape, used: false });
    }
    setGameShapes(shapes);
  };

  useEffect(() => {
    generateShapes();
  }, []);

  // Check for game over
  useEffect(() => {
    if (gameOver) return;
    
    const availableShapes = gameShapes.filter(s => !s.used);
    if (availableShapes.length === 0) return;

    let canMove = false;
    for (const shapeObj of availableShapes) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceShape(shapeObj.shape, r, c, grid)) {
            canMove = true;
            break;
          }
        }
        if (canMove) break;
      }
      if (canMove) break;
    }

    if (!canMove) {
      setGameOver(true);
    }
  }, [grid, gameShapes, gameOver]);

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    setScore(0);
    setGameOver(false);
    generateShapes();
  };

  // Check if shape can be placed at position
  const canPlaceShape = (shape, row, col, currentGrid = grid) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const gridRow = row + r;
          const gridCol = col + c;
          if (
            gridRow < 0 || gridRow >= GRID_SIZE ||
            gridCol < 0 || gridCol >= GRID_SIZE ||
            currentGrid[gridRow][gridCol] === 1
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place shape on grid
  const placeShape = (shape, row, col) => {
    const newGrid = grid.map(r => [...r]);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          newGrid[row + r][col + c] = 1;
        }
      }
    }
    return newGrid;
  };

  // Clear complete rows and columns
  const clearLines = (currentGrid) => {
    let newGrid = currentGrid.map(r => [...r]);
    let linesCleared = 0;

    // Check rows
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell === 1)) {
        newGrid[r] = Array(GRID_SIZE).fill(0);
        linesCleared++;
      }
    }

    // Check columns
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid.every(row => row[c] === 1)) {
        for (let r = 0; r < GRID_SIZE; r++) {
          newGrid[r][c] = 0;
        }
        linesCleared++;
      }
    }

    return { newGrid, linesCleared };
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (!draggedShape || draggedShape.used) return;

    if (canPlaceShape(draggedShape.shape, row, col)) {
      let newGrid = placeShape(draggedShape.shape, row, col);
      const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
      
      setGrid(clearedGrid);
      setScore(prev => prev + (draggedShape.shape.flat().filter(x => x === 1).length * 10) + (linesCleared * 100));
      
      // Mark shape as used
      setGameShapes(prev => 
        prev.map(s => s.id === draggedShape.id ? { ...s, used: true } : s)
      );
      
      setDraggedShape(null);
      setPreviewPos(null);

      // Generate new shapes if all used
      if (gameShapes.filter(s => !s.used).length === 1) {
        setTimeout(generateShapes, 500);
      }
    }
  };

  // Handle cell hover for preview
  const handleCellHover = (row, col) => {
    if (!draggedShape || draggedShape.used) {
      setPreviewPos(null);
      return;
    }

    if (canPlaceShape(draggedShape.shape, row, col)) {
      setPreviewPos({ row, col, valid: true });
    } else {
      setPreviewPos({ row, col, valid: false });
    }
  };

  // Check if preview should show on this cell
  const isPreviewCell = (row, col) => {
    if (!previewPos || !draggedShape) return null;
    const relRow = row - previewPos.row;
    const relCol = col - previewPos.col;
    if (
      relRow >= 0 && relRow < draggedShape.shape.length &&
      relCol >= 0 && relCol < draggedShape.shape[0].length &&
      draggedShape.shape[relRow][relCol] === 1
    ) {
      return previewPos.valid ? 'valid' : 'invalid';
    }
    return null;
  };

  return (
    <div className="blockblast-container">
      {gameOver && <div className="blockblast-overlay" />}
      <div className="blockblast-game">
        <div className="blockblast-grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="blockblast-row">
              {row.map((cell, colIndex) => {
                const preview = isPreviewCell(rowIndex, colIndex);
                return (
                  <div
                    key={colIndex}
                    className={`blockblast-cell ${cell === 1 ? 'filled' : ''} ${preview ? `preview-${preview}` : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={() => setPreviewPos(null)}
                  />
                );
              })}
            </div>
          ))}
          {gameOver && (
            <button className="blockblast-restart-btn" onClick={resetGame}>
              {t.restart || "Restart"}
            </button>
          )}
        </div>

        <div className="blockblast-right">
          <div className="blockblast-score" style={{ position: gameOver ? 'relative' : 'static', zIndex: gameOver ? 10 : 'auto' }}>{t.blockBlastScore}: {score}</div>
          <div className="blockblast-shapes">
            {gameShapes.map((shapeObj) => (
              <div
                key={shapeObj.id}
                className={`blockblast-shape-container ${shapeObj.used ? 'used' : ''} ${draggedShape?.id === shapeObj.id ? 'selected' : ''}`}
                onClick={() => !shapeObj.used && setDraggedShape(shapeObj)}
              >
                {shapeObj.shape.map((row, rowIndex) => (
                  <div key={rowIndex} className="blockblast-shape-row">
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className={`blockblast-shape-cell ${cell === 1 ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockBlast;
