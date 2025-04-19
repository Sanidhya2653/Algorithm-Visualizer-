// Sorting Algorithms Visualizer
document.addEventListener('DOMContentLoaded', function() {
  const barsContainer = document.getElementById('sorting-bars');
  const startBtn = document.getElementById('sort-start');
  const resetBtn = document.getElementById('sort-reset');
  const shuffleBtn = document.getElementById('sort-shuffle');
  const algorithmSelect = document.getElementById('sort-algorithm');
  const sizeControl = document.getElementById('array-size');
  const speedControl = document.getElementById('sort-speed');
  
  // Sorting configuration
  let array = [];
  let animationSpeed = 100;
  let isSorting = false;
  let animations = [];
  
  // Initialize array
  function initializeArray() {
    const size = parseInt(sizeControl.value);
    array = Array.from({length: size}, () => Math.floor(Math.random() * 100) + 5);
    renderBars();
  }
  
  // Render bars
  function renderBars() {
    barsContainer.innerHTML = '';
    const maxHeight = Math.max(...array);
    
    array.forEach((value, index) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${(value / maxHeight) * 100}%`;
      barsContainer.appendChild(bar);
    });
  }
  
  // Shuffle array
  function shuffleArray() {
    if (isSorting) return;
    initializeArray();
  }
  
  // Start sorting
  async function startSorting() {
    if (isSorting) return;
    isSorting = true;
    
    // Disable controls
    startBtn.disabled = true;
    resetBtn.disabled = true;
    shuffleBtn.disabled = true;
    algorithmSelect.disabled = true;
    sizeControl.disabled = true;
    
    // Generate animations based on selected algorithm
    animations = [];
    const algorithm = algorithmSelect.value;
    
    switch(algorithm) {
      case 'bubble':
        bubbleSortAnimations();
        break;
      case 'selection':
        selectionSortAnimations();
        break;
      case 'insertion':
        insertionSortAnimations();
        break;
      
    }
    
    // Play animations
    await playAnimations();
    
    // Enable controls
    startBtn.disabled = false;
    resetBtn.disabled = false;
    shuffleBtn.disabled = false;
    algorithmSelect.disabled = false;
    sizeControl.disabled = false;
    isSorting = false;
  }
  
  // Bubble Sort animations
  function bubbleSortAnimations() {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare
        animations.push({type: 'compare', indices: [j, j+1]});
        
        if (arr[j] > arr[j+1]) {
          // Swap
          animations.push({type: 'swap', indices: [j, j+1]});
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        }
      }
      // Mark as sorted
      animations.push({type: 'sorted', index: n - i - 1});
    }
    animations.push({type: 'sorted', index: 0});
  }
  
  // Selection Sort animations
  function selectionSortAnimations() {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      
      for (let j = i + 1; j < n; j++) {
        // Compare
        animations.push({type: 'compare', indices: [minIdx, j]});
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        // Swap
        animations.push({type: 'swap', indices: [i, minIdx]});
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }
      
      // Mark as sorted
      animations.push({type: 'sorted', index: i});
    }
    animations.push({type: 'sorted', index: n - 1});
  }
  
  // Insertion Sort animations
  function insertionSortAnimations() {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
      let j = i;
      
      while (j > 0 && arr[j] < arr[j - 1]) {
        // Compare
        animations.push({type: 'compare', indices: [j, j - 1]});
        
        // Swap
        animations.push({type: 'swap', indices: [j, j - 1]});
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        j--;
      }
    }
    
    // Mark all as sorted at the end
    for (let i = 0; i < n; i++) {
      animations.push({type: 'sorted', index: i});
    }
  }
  
  
  // Play animations
  async function playAnimations() {
    const bars = document.querySelectorAll('.bar');
    const speed = 1100 - (speedControl.value * 100); // Convert to ms
    
    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];
      
      switch(animation.type) {
        case 'compare':
          bars[animation.indices[0]].classList.add('comparing');
          bars[animation.indices[1]].classList.add('comparing');
          break;
        case 'swap':
          // Get heights
          const tempHeight = bars[animation.indices[0]].style.height;
          bars[animation.indices[0]].style.height = bars[animation.indices[1]].style.height;
          bars[animation.indices[1]].style.height = tempHeight;
          break;
        case 'sorted':
          bars[animation.index].classList.remove('comparing');
          bars[animation.index].classList.add('sorted');
          break;
        case 'pivot':
          bars[animation.index].classList.remove('comparing');
          bars[animation.index].classList.add('pivot');
          break;
      }
      
      // Wait for next animation
      await new Promise(resolve => setTimeout(resolve, speed));
      
      // Remove comparing class if not in next animation
      if (animation.type === 'compare' && 
          (i === animations.length - 1 || animations[i+1].type !== 'compare' || 
           !arraysEqual(animation.indices, animations[i+1].indices))) {
        bars[animation.indices[0]].classList.remove('comparing');
        bars[animation.indices[1]].classList.remove('comparing');
      }
    }
  }
  
  function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
  
  // Event listeners
  startBtn.addEventListener('click', startSorting);
  resetBtn.addEventListener('click', initializeArray);
  shuffleBtn.addEventListener('click', shuffleArray);
  sizeControl.addEventListener('input', initializeArray);
  speedControl.addEventListener('input', function() {
    animationSpeed = 1100 - (this.value * 100);
  });
  
  // Initialize
  initializeArray();
  
  // Update algorithm details
  algorithmSelect.addEventListener('change', function() {
    updateAlgorithmDetails(this.value);
  });
  
  function updateAlgorithmDetails(algorithm) {
    const details = {
      'bubble': {
        description: 'Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        best: 'O(n)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        steps: [
          'Start with first element',
          'Compare with next element',
          'Swap if in wrong order',
          'Move to next element',
          'Repeat until no swaps needed'
        ]
      },
      'selection': {
        description: 'Selection sort divides the input list into two parts: a sorted sublist and an unsorted sublist.',
        best: 'O(n²)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        steps: [
          'Find the minimum element in the unsorted array',
          'Swap it with the first unsorted element',
          'Move the boundary between sorted and unsorted one element ahead',
          'Repeat until array is sorted'
        ]
      },
      'insertion': {
        description: 'Insertion sort builds the final sorted array one item at a time by comparisons.',
        best: 'O(n)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        steps: [
          'Start with the second element',
          'Compare with previous elements',
          'Insert the element in the correct position',
          'Repeat for all elements'
        ]
      }
    };
    
    const algo = details[algorithm];
    document.getElementById('sort-description').textContent = algo.description;
    document.getElementById('sort-best').textContent = algo.best;
    document.getElementById('sort-avg').textContent = algo.avg;
    document.getElementById('sort-worst').textContent = algo.worst;
    document.getElementById('sort-space').textContent = algo.space;
    
    const stepsList = document.getElementById('sort-steps');
    stepsList.innerHTML = '';
    algo.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
    });
    
    document.getElementById('sort-total-steps').textContent = algo.steps.length;
  }
  
  // Initialize details
  updateAlgorithmDetails(algorithmSelect.value);
});