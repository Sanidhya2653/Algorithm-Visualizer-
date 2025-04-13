document.addEventListener('DOMContentLoaded', function() {
  const visualizationContainer = document.getElementById('nqueens-visualization');
  const startBtn = document.getElementById('nqueens-start');
  const resetBtn = document.getElementById('nqueens-reset');
  const sizeControl = document.getElementById('nqueens-size');
  const speedControl = document.getElementById('nqueens-speed');
  const pauseBtn = document.getElementById('nqueens-pause');
  const stepBtn = document.getElementById('nqueens-step');
  const statusText = document.getElementById('nqueens-status');
  
  let boardSize = 8;
  let baseAnimationSpeed = 500;
  let currentSpeed = 5;
  let isSolving = false;
  let isPaused = false;
  let currentStep = 0;
  let totalSteps = 0;
  let board = [];
  let timeoutId = null;

  // Initialize the board
  function initializeBoard() {
    visualizationContainer.innerHTML = '';
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    const boardElement = document.createElement('div');
    boardElement.className = 'nqueens-board';
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
    
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const cell = document.createElement('div');
        cell.className = 'nqueens-cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        boardElement.appendChild(cell);
      }
    }
    
    visualizationContainer.appendChild(boardElement);
    currentStep = 0;
    updateProgress();
    updateStatus('Ready');
  }

  // Enhanced visual delay with pause support
  async function visualDelay() {
    if (!isSolving) return;
    
    if (isPaused) {
      await new Promise(resolve => {
        const checkPause = setInterval(() => {
          if (!isPaused || !isSolving) {
            clearInterval(checkPause);
            resolve();
          }
        }, 100);
      });
    }
    
    return new Promise(resolve => {
      timeoutId = setTimeout(resolve, baseAnimationSpeed / currentSpeed);
    });
  }

  // Update board visualization with animations
  function updateBoard() {
    const cells = visualizationContainer.querySelectorAll('.nqueens-cell');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      
      cell.classList.remove(
        'queen', 
        'checking', 
        'queen-placing', 
        'queen-removing',
        'threat'
      );
      
      if (board[row][col] === 1) {
        cell.classList.add('queen');
      }
    });
  }

  // Enhanced backtracking with visualization
  async function backtrack(col) {
    if (!isSolving) return false;
    
    currentStep++;
    updateProgress();
    updateStatus(`Checking column ${col+1}/${boardSize}`);
    
    if (col >= boardSize) {
      updateStatus('Solution found!');
      return true;
    }
    
    for (let row = 0; row < boardSize; row++) {
      if (!isSolving) return false;
      
      const cell = visualizationContainer.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      
      // Visualize checking this position
      cell.classList.add('checking');
      await visualDelay();
      
      if (isSafe(row, col)) {
        // Visualize placing queen
        cell.classList.remove('checking');
        cell.classList.add('queen-placing');
        board[row][col] = 1;
        updateBoard();
        await visualDelay();
        
        updateStatus(`Queen placed at (${row+1},${col+1})`);
        
        // Recursive call
        if (await backtrack(col + 1)) {
          return true;
        }
        
        if (!isSolving) return false;
        
        // Visualize backtracking (removing queen)
        cell.classList.remove('queen-placing');
        cell.classList.add('queen-removing');
        board[row][col] = 0;
        updateBoard();
        await visualDelay();
        cell.classList.remove('queen-removing');
        
        updateStatus(`Backtracking from (${row+1},${col+1})`);
      } else {
        cell.classList.remove('checking');
        updateStatus(`Conflict at (${row+1},${col+1})`);
        await visualDelay();
      }
    }
    return false;
  }

  // Safety check for queen placement
  function isSafe(row, col) {
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

  // Main solve function
  async function solveNQueens() {
    if (isSolving) return;
    
    isSolving = true;
    isPaused = false;
    startBtn.disabled = true;
    resetBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    
    totalSteps = boardSize * boardSize * 3; // Better estimate
    currentStep = 0;
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    updateStatus('Solving...');
    initializeBoard();
    
    const foundSolution = await backtrack(0);
    
    if (!foundSolution) {
      updateStatus('No solution found!');
    }
    
    isSolving = false;
    startBtn.disabled = false;
  }

  // Update progress display
  function updateProgress() {
    const percent = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
    document.getElementById('nqueens-current-step').textContent = currentStep;
    document.getElementById('nqueens-total-steps').textContent = totalSteps;
    document.getElementById('nqueens-percent').textContent = `${percent}% Complete`;
    document.getElementById('nqueens-progress').style.width = `${percent}%`;
  }

  // Update status text
  function updateStatus(text) {
    if (statusText) {
      statusText.textContent = text;
    }
  }

  // Reset everything
  function resetBoard() {
    isSolving = false;
    isPaused = false;
    clearTimeout(timeoutId);
    startBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    boardSize = parseInt(sizeControl.value);
    totalSteps = boardSize * boardSize * 3;
    initializeBoard();
  }

  // Event listeners
  startBtn.addEventListener('click', solveNQueens);
  resetBtn.addEventListener('click', resetBoard);
  
  pauseBtn.addEventListener('click', () => {
    if (!isSolving) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    updateStatus(isPaused ? 'Paused' : 'Resuming...');
  });
  
  stepBtn.addEventListener('click', () => {
    if (isSolving && isPaused) {
      isPaused = false;
      setTimeout(() => {
        isPaused = true;
        pauseBtn.textContent = 'Resume';
      }, 50);
    }
  });
  
  sizeControl.addEventListener('input', resetBoard);
  
  speedControl.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    updateStatus(`Speed set to ${currentSpeed}/10`);
  });

  // Initialize
  resetBoard();
});