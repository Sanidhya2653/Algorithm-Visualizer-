document.addEventListener('DOMContentLoaded', function() {
  const visualizationContainer = document.getElementById('nqueens-visualization');
  const startBtn = document.getElementById('nqueens-start');
  const resetBtn = document.getElementById('nqueens-reset');
  const sizeControl = document.getElementById('nqueens-size');
  const speedControl = document.getElementById('nqueens-speed');
  
  let boardSize = 8;
  let animationSpeed = 500;
  let isSolving = false;
  let currentStep = 0;
  let totalSteps = 0;

  function initializeBoard() {
    visualizationContainer.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'nqueens-board';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
    
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const cell = document.createElement('div');
        cell.className = 'nqueens-cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        board.appendChild(cell);
      }
    }
    
    visualizationContainer.appendChild(board);
  }

  async function solveNQueens() {
    if (isSolving) return;
    isSolving = true;
    startBtn.disabled = true;
    resetBtn.disabled = true;
    
    const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    let solutionFound = false;
    
    async function backtrack(col) {
      if (col >= boardSize) {
        solutionFound = true;
        return true;
      }
      
      for (let row = 0; row < boardSize; row++) {
        if (isSafe(board, row, col)) {
          board[row][col] = 1;
          updateBoard(board);
          currentStep++;
          updateProgress();
          await delay();
          
          if (await backtrack(col + 1)) {
            return true;
          }
          
          board[row][col] = 0;
          updateBoard(board);
          currentStep++;
          updateProgress();
          await delay();
        }
      }
      return false;
    }
    
    await backtrack(0);
    
    if (!solutionFound) {
      alert('No solution found!');
    }
    
    isSolving = false;
    startBtn.disabled = false;
    resetBtn.disabled = false;
  }

  function isSafe(board, row, col) {
    // Check row
    for (let i = 0; i < col; i++) {
      if (board[row][i] === 1) return false;
    }
    
    // Check upper diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false;
    }
    
    // Check lower diagonal
    for (let i = row, j = col; i < boardSize && j >= 0; i++, j--) {
      if (board[i][j] === 1) return false;
    }
    
    return true;
  }

  function updateBoard(board) {
    const cells = visualizationContainer.querySelectorAll('.nqueens-cell');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      cell.classList.remove('queen', 'threat');
      if (board[row][col] === 1) {
        cell.classList.add('queen');
      }
    });
  }

  function resetBoard() {
    if (isSolving) return;
    initializeBoard();
    currentStep = 0;
    updateProgress();
  }

  function updateProgress() {
    const percent = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
    document.getElementById('nqueens-current-step').textContent = currentStep;
    document.getElementById('nqueens-percent').textContent = `${percent}% Complete`;
    document.getElementById('nqueens-progress').style.width = `${percent}%`;
  }

  function delay() {
    return new Promise(resolve => setTimeout(resolve, animationSpeed));
  }

  // Event listeners
  startBtn.addEventListener('click', solveNQueens);
  resetBtn.addEventListener('click', resetBoard);
  sizeControl.addEventListener('input', function() {
    boardSize = parseInt(this.value);
    totalSteps = boardSize * boardSize * 2;
    resetBoard();
  });
  speedControl.addEventListener('input', function() {
    animationSpeed = 550 - (this.value * 50);
  });

  // Initialize
  boardSize = parseInt(sizeControl.value);
  totalSteps = boardSize * boardSize * 2;
  initializeBoard();
});