// Pathfinding Algorithms Visualizer
document.addEventListener('DOMContentLoaded', function() {
  const gridContainer = document.getElementById('pathfinding-grid');
  const startBtn = document.getElementById('pf-start');
  const resetBtn = document.getElementById('pf-reset');
  const algorithmSelect = document.getElementById('pf-algorithm');
  const speedControl = document.getElementById('pf-speed');
  const wallBtn = document.getElementById('pf-wall');
  const startNodeBtn = document.getElementById('pf-start-node');
  const endNodeBtn = document.getElementById('pf-end-node');
  
  // Grid configuration
  const rows = 20;
  const cols = 20;
  let grid = [];
  let startNode = { row: 5, col: 5 };
  let endNode = { row: 15, col: 15 };
  let drawingMode = 'wall'; // wall, start, end
  let isDrawing = false;
  let isRunning = false;
  let animationSpeed = 50;
  
  // Initialize grid
  function initializeGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    grid = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
      isWall: false,
      isStart: false,
      isEnd: false,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
      fScore: Infinity,
      gScore: Infinity,
      hScore: Infinity
    })));
    
    // Create cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        if (row === startNode.row && col === startNode.col) {
          cell.classList.add('start');
          grid[row][col].isStart = true;
          grid[row][col].distance = 0;
          grid[row][col].gScore = 0;
        } else if (row === endNode.row && col === endNode.col) {
          cell.classList.add('end');
          grid[row][col].isEnd = true;
        }
        
        // Mouse events for drawing
        cell.addEventListener('mousedown', () => {
          isDrawing = true;
          handleCellInteraction(row, col);
        });
        
        cell.addEventListener('mouseenter', () => {
          if (isDrawing) {
            handleCellInteraction(row, col);
          }
        });
        
        cell.addEventListener('mouseup', () => {
          isDrawing = false;
        });
        
        gridContainer.appendChild(cell);
      }
    }
  }
  
  // Handle cell interaction based on drawing mode
  function handleCellInteraction(row, col) {
    if (isRunning) return;
    
    const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const gridCell = grid[row][col];
    
    if (drawingMode === 'wall') {
      if (!gridCell.isStart && !gridCell.isEnd) {
        gridCell.isWall = !gridCell.isWall;
        cell.classList.toggle('wall', gridCell.isWall);
      }
    } else if (drawingMode === 'start') {
      if (!gridCell.isWall && !gridCell.isEnd) {
        // Remove old start
        const oldStart = gridContainer.querySelector('.start');
        if (oldStart) {
          oldStart.classList.remove('start');
          grid[startNode.row][startNode.col].isStart = false;
          grid[startNode.row][startNode.col].distance = Infinity;
          grid[startNode.row][startNode.col].gScore = Infinity;
        }
        
        // Set new start
        cell.classList.add('start');
        gridCell.isStart = true;
        gridCell.distance = 0;
        gridCell.gScore = 0;
        startNode = { row, col };
      }
    } else if (drawingMode === 'end') {
      if (!gridCell.isWall && !gridCell.isStart) {
        // Remove old end
        const oldEnd = gridContainer.querySelector('.end');
        if (oldEnd) {
          oldEnd.classList.remove('end');
          grid[endNode.row][endNode.col].isEnd = false;
        }
        
        // Set new end
        cell.classList.add('end');
        gridCell.isEnd = true;
        endNode = { row, col };
      }
    }
  }
  
  // Reset the grid
  function resetGrid() {
    if (isRunning) return;

    // Clear all visualizations and remove walls
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const gridCell = grid[row][col];

            // Reset cell state
            gridCell.isVisited = false;
            gridCell.isPath = false;
            gridCell.distance = Infinity;
            gridCell.previousNode = null;
            gridCell.fScore = Infinity;
            gridCell.gScore = Infinity;
            gridCell.hScore = Infinity;
            gridCell.isWall = false; // Clear the wall

            // Reset visual classes
            cell.className = 'grid-cell';

            if (gridCell.isStart) {
                cell.classList.add('start');
                gridCell.distance = 0;
                gridCell.gScore = 0;
            } else if (gridCell.isEnd) {
                cell.classList.add('end');
            }
        }
    }

    updateProgress(0, 1);
  }
  
  // Clear visualization (keep walls)
  function clearVisualization() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = gridContainer.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const gridCell = grid[row][col];
        
        if (!gridCell.isStart && !gridCell.isEnd && !gridCell.isWall) {
          cell.className = 'grid-cell';
          gridCell.isVisited = false;
          gridCell.isPath = false;
        }
      }
    }
  }
  
  // Start pathfinding
  async function startPathfinding() {
    if (isRunning) return;
    isRunning = true;
    
    // Disable controls
    startBtn.disabled = true;
    resetBtn.disabled = true;
    algorithmSelect.disabled = true;
    wallBtn.disabled = true;
    startNodeBtn.disabled = true;
    endNodeBtn.disabled = true;
    
    // Clear previous visualization
    clearVisualization();
    
    const algorithm = algorithmSelect.value;
    let foundPath = false;
    
    switch(algorithm) {
      case 'dijkstra':
        foundPath = await visualizeDijkstra();
        break;
      case 'astar':
        foundPath = await visualizeAStar();
        break;
      case 'bfs':
        foundPath = await visualizeBFS();
        break;
      case 'dfs':
        foundPath = await visualizeDFS();
        break;
    }
    
    if (foundPath) {
      await visualizePath();
    } else {
      updateOutput('No path found!');
    }
    
    // Enable controls
    startBtn.disabled = false;
    resetBtn.disabled = false;
    algorithmSelect.disabled = false;
    wallBtn.disabled = false;
    startNodeBtn.disabled = false;
    endNodeBtn.disabled = false;
    isRunning = false;
  }
  
  // Dijkstra's algorithm
  async function visualizeDijkstra() {
    const unvisitedNodes = getAllNodes();
    let totalSteps = unvisitedNodes.length;
    let currentStep = 0;
    
    while (unvisitedNodes.length > 0) {
      // Sort nodes by distance
      unvisitedNodes.sort((a, b) => grid[a.row][a.col].distance - grid[b.row][b.col].distance);
      const closestNode = unvisitedNodes.shift();
      const gridCell = grid[closestNode.row][closestNode.col];
      
      // If we hit a wall, skip it
      if (gridCell.isWall) continue;
      
      // If the closest node is at infinity, we're stuck
      if (gridCell.distance === Infinity) {
        return false;
      }
      
      // Mark as visited
      gridCell.isVisited = true;
      const cell = gridContainer.querySelector(`[data-row="${closestNode.row}"][data-col="${closestNode.col}"]`);
      if (!gridCell.isStart && !gridCell.isEnd) {
        cell.classList.add('visited');
      }
      
      // Update progress
      updateProgress(++currentStep, totalSteps);
      await delay();
      
      // If we reached the end, we're done
      if (gridCell.isEnd) {
        return true;
      }
      
      // Update neighbors
      await updateNeighbors(closestNode, 'dijkstra');
    }
    
    return false;
  }
  
  // A* algorithm
  async function visualizeAStar() {
    // Initialize open and closed sets
    const openSet = [];
    const closedSet = new Set();
    let totalSteps = rows * cols;
    let currentStep = 0;
    
    // Calculate heuristic (Manhattan distance)
    function heuristic(node) {
      return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
    }
    
    // Add start node to open set
    grid[startNode.row][startNode.col].gScore = 0;
    grid[startNode.row][startNode.col].hScore = heuristic(startNode);
    grid[startNode.row][startNode.col].fScore = grid[startNode.row][startNode.col].hScore;
    openSet.push(startNode);
    
    while (openSet.length > 0) {
      // Sort open set by fScore
      openSet.sort((a, b) => grid[a.row][a.col].fScore - grid[b.row][b.col].fScore);
      const currentNode = openSet.shift();
      
      // If we reached the end, we're done
      if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
        return true;
      }
      
      // Add to closed set
      closedSet.add(`${currentNode.row},${currentNode.col}`);
      
      // Mark as visited (unless it's start/end node)
      if (!grid[currentNode.row][currentNode.col].isStart && 
          !grid[currentNode.row][currentNode.col].isEnd) {
        grid[currentNode.row][currentNode.col].isVisited = true;
        const cell = gridContainer.querySelector(`[data-row="${currentNode.row}"][data-col="${currentNode.col}"]`);
        cell.classList.add('visited');
      }
      
      // Update progress
      updateProgress(++currentStep, totalSteps);
      await delay();
      
      // Get neighbors
      const neighbors = getNeighbors(currentNode);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        
        // Skip if in closed set or is wall
        if (closedSet.has(neighborKey) || grid[neighbor.row][neighbor.col].isWall) {
          continue;
        }
        
        // Calculate tentative gScore
        const tentativeGScore = grid[currentNode.row][currentNode.col].gScore + 1;
        
        // If this path to neighbor is better
        if (tentativeGScore < grid[neighbor.row][neighbor.col].gScore) {
          // Update neighbor's previous node
          grid[neighbor.row][neighbor.col].previousNode = currentNode;
          grid[neighbor.row][neighbor.col].gScore = tentativeGScore;
          grid[neighbor.row][neighbor.col].hScore = heuristic(neighbor);
          grid[neighbor.row][neighbor.col].fScore = 
            grid[neighbor.row][neighbor.col].gScore + grid[neighbor.row][neighbor.col].hScore;
          
          // Add to open set if not already there
          if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    // No path found
    return false;
  }
  
  // Breadth-First Search
  async function visualizeBFS() {
    const queue = [];
    const visited = new Set();
    let totalSteps = rows * cols;
    let currentStep = 0;
    
    // Add start node to queue
    queue.push(startNode);
    visited.add(`${startNode.row},${startNode.col}`);
    
    while (queue.length > 0) {
      const currentNode = queue.shift();
      
      // If we reached the end, we're done
      if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
        return true;
      }
      
      // Mark as visited (unless it's start/end node)
      if (!grid[currentNode.row][currentNode.col].isStart && 
          !grid[currentNode.row][currentNode.col].isEnd) {
        grid[currentNode.row][currentNode.col].isVisited = true;
        const cell = gridContainer.querySelector(`[data-row="${currentNode.row}"][data-col="${currentNode.col}"]`);
        cell.classList.add('visited');
      }
      
      // Update progress
      updateProgress(++currentStep, totalSteps);
      await delay();
      
      // Get neighbors
      const neighbors = getNeighbors(currentNode);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        
        // Skip if visited or is wall
        if (visited.has(neighborKey) || grid[neighbor.row][neighbor.col].isWall) {
          continue;
        }
        
        // Mark as visited and set previous node
        visited.add(neighborKey);
        grid[neighbor.row][neighbor.col].previousNode = currentNode;
        
        // Add to queue
        queue.push(neighbor);
      }
    }
    
    // No path found
    return false;
  }
  
  // Depth-First Search
  async function visualizeDFS() {
    const stack = [];
    const visited = new Set();
    let totalSteps = rows * cols;
    let currentStep = 0;
    
    // Add start node to stack
    stack.push(startNode);
    visited.add(`${startNode.row},${startNode.col}`);
    
    while (stack.length > 0) {
      const currentNode = stack.pop();
      
      // If we reached the end, we're done
      if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
        return true;
      }
      
      // Mark as visited (unless it's start/end node)
      if (!grid[currentNode.row][currentNode.col].isStart && 
          !grid[currentNode.row][currentNode.col].isEnd) {
        grid[currentNode.row][currentNode.col].isVisited = true;
        const cell = gridContainer.querySelector(`[data-row="${currentNode.row}"][data-col="${currentNode.col}"]`);
        cell.classList.add('visited');
      }
      
      // Update progress
      updateProgress(++currentStep, totalSteps);
      await delay();
      
      // Get neighbors
      const neighbors = getNeighbors(currentNode);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        
        // Skip if visited or is wall
        if (visited.has(neighborKey) || grid[neighbor.row][neighbor.col].isWall) {
          continue;
        }
        
        // Mark as visited and set previous node
        visited.add(neighborKey);
        grid[neighbor.row][neighbor.col].previousNode = currentNode;
        
        // Add to stack
        stack.push(neighbor);
      }
    }
    
    // No path found
    return false;
  }
  
  // Visualize the final path
  async function visualizePath() {
    const path = [];
    let currentNode = endNode;
    
    // Reconstruct path
    while (currentNode !== null && !(currentNode.row === startNode.row && currentNode.col === startNode.col)) {
      path.unshift(currentNode);
      currentNode = grid[currentNode.row][currentNode.col].previousNode;
    }
    
    // Animate path
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      if (!grid[node.row][node.col].isStart && !grid[node.row][node.col].isEnd) {
        grid[node.row][node.col].isPath = true;
        const cell = gridContainer.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
        cell.classList.add('path');
        await delay();
      }
    }
  }
  
  // Helper functions
  function getAllNodes() {
    const nodes = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        nodes.push({ row, col });
      }
    }
    return nodes;
  }
  
  function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;
    
    if (row > 0) neighbors.push({ row: row - 1, col }); // Up
    if (row < rows - 1) neighbors.push({ row: row + 1, col }); // Down
    if (col > 0) neighbors.push({ row, col: col - 1 }); // Left
    if (col < cols - 1) neighbors.push({ row, col: col + 1 }); // Right
    
    return neighbors;
  }
  
  async function updateNeighbors(node, algorithm) {
    const neighbors = getNeighbors(node);
    
    for (const neighbor of neighbors) {
      const gridCell = grid[neighbor.row][neighbor.col];
      
      // Skip if wall or already visited
      if (gridCell.isWall || gridCell.isVisited) {
        continue;
      }
      
      // Update distance/gScore based on algorithm
      if (algorithm === 'dijkstra') {
        const newDistance = grid[node.row][node.col].distance + 1;
        if (newDistance < gridCell.distance) {
          gridCell.distance = newDistance;
          gridCell.previousNode = node;
        }
      } else if (algorithm === 'astar') {
        const newGScore = grid[node.row][node.col].gScore + 1;
        if (newGScore < gridCell.gScore) {
          gridCell.gScore = newGScore;
          gridCell.previousNode = node;
        }
      }
    }
  }
  
  function delay() {
    return new Promise(resolve => setTimeout(resolve, animationSpeed));
  }
  
  function updateProgress(step, totalSteps) {
    const percent = Math.min(100, Math.floor((step / totalSteps) * 100));
    document.getElementById('pf-current-step').textContent = step;
    document.getElementById('pf-percent').textContent = `${percent}% Complete`;
    document.getElementById('pf-progress').style.width = `${percent}%`;
  }
  
  function updateOutput(message) {
    console.log(message);
    // You can add a visual output element if needed
  }
  
  // Event listeners
  startBtn.addEventListener('click', startPathfinding);
  resetBtn.addEventListener('click', resetGrid);
  speedControl.addEventListener('input', function() {
    animationSpeed = 110 - this.value * 10; // Range from 10-100ms
  });
  
  // Drawing mode buttons
  wallBtn.addEventListener('click', function() {
    drawingMode = 'wall';
    wallBtn.classList.add('active');
    startNodeBtn.classList.remove('active');
    endNodeBtn.classList.remove('active');
  });
  
  startNodeBtn.addEventListener('click', function() {
    drawingMode = 'start';
    startNodeBtn.classList.add('active');
    wallBtn.classList.remove('active');
    endNodeBtn.classList.remove('active');
  });
  
  endNodeBtn.addEventListener('click', function() {
    drawingMode = 'end';
    endNodeBtn.classList.add('active');
    wallBtn.classList.remove('active');
    startNodeBtn.classList.remove('active');
  });
  
  // Update algorithm details
  algorithmSelect.addEventListener('change', function() {
    updateAlgorithmDetails(this.value);
  });
  
  function updateAlgorithmDetails(algorithm) {
    const details = {
      'dijkstra': {
        description: "Dijkstra's algorithm finds the shortest path between nodes in a graph with non-negative edge weights.",
        best: 'O(E + V log V)',
        avg: 'O(E + V log V)',
        worst: 'O(E + V log V)',
        space: 'O(V)',
        steps: [
          'Initialize distance values for all nodes (INF for all except start node = 0)',
          'Create a priority queue with all nodes',
          'While queue is not empty, extract node with minimum distance',
          'For each neighbor, update distances if shorter path found',
          'When end node is reached, reconstruct the path'
        ]
      },
      'astar': {
        description: 'A* search finds the shortest path between nodes using heuristics to guide its search.',
        best: 'O(E)',
        avg: 'O(E)',
        worst: 'O(V²)',
        space: 'O(V)',
        steps: [
          'Initialize open and closed sets',
          'Add start node to open set with f-score = heuristic',
          'While open set is not empty, select node with lowest f-score',
          'If current node is the goal, reconstruct and return the path',
          'Add current node to closed set and process all neighbors'
        ]
      },
      'bfs': {
        description: 'Breadth-first search explores all nodes at the present depth before moving to nodes at the next depth level.',
        best: 'O(V + E)',
        avg: 'O(V + E)',
        worst: 'O(V + E)',
        space: 'O(V)',
        steps: [
          'Initialize a queue and visited set',
          'Add start node to queue and mark as visited',
          'While queue is not empty, dequeue a node',
          'If node is the goal, reconstruct and return the path',
          'Enqueue all unvisited neighbors and mark them as visited'
        ]
      },
      'dfs': {
        description: 'Depth-first search explores as far as possible along each branch before backtracking.',
        best: 'O(V + E)',
        avg: 'O(V + E)',
        worst: 'O(V + E)',
        space: 'O(V)',
        steps: [
          'Initialize a stack and visited set',
          'Push start node to stack and mark as visited',
          'While stack is not empty, pop a node',
          'If node is the goal, reconstruct and return the path',
          'Push all unvisited neighbors to stack and mark them as visited'
        ]
      }
    };
    
    const algo = details[algorithm];
    document.getElementById('pf-description').textContent = algo.description;
    document.getElementById('pf-best').textContent = algo.best;
    document.getElementById('pf-avg').textContent = algo.avg;
    document.getElementById('pf-worst').textContent = algo.worst;
    document.getElementById('pf-space').textContent = algo.space;
    
    const stepsList = document.getElementById('pf-steps');
    stepsList.innerHTML = '';
    algo.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
    });
    
    document.getElementById('pf-total-steps').textContent = algo.steps.length;
  }
  
  // Initialize
  initializeGrid();
  updateAlgorithmDetails(algorithmSelect.value);
  
  // Set initial active drawing mode
  wallBtn.classList.add('active');
});