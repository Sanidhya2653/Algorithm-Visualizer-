document.addEventListener('DOMContentLoaded', function() {
  const visualizationContainer = document.getElementById('binarysearch-visualization');
  const startBtn = document.getElementById('binarysearch-start');
  const resetBtn = document.getElementById('binarysearch-reset');
  const sizeControl = document.getElementById('binarysearch-size');
  const speedControl = document.getElementById('binarysearch-speed');
  
  let arraySize = 20;
  let animationSpeed = 500;
  let isRunning = false;
  let currentStep = 0;
  let totalSteps = 0;
  let array = [];
  let target = 0;

  function initializeArray() {
    visualizationContainer.innerHTML = '';
    
    array = Array.from({length: arraySize}, (_, i) => i + 1);
    target = Math.floor(Math.random() * arraySize) + 1;
    totalSteps = Math.ceil(Math.log2(arraySize)) * 2;
    
    const arrayContainer = document.createElement('div');
    arrayContainer.className = 'binarysearch-array';
    
    array.forEach((num, index) => {
      const element = document.createElement('div');
      element.className = 'binarysearch-element';
      element.textContent = num;
      element.dataset.index = index;
      arrayContainer.appendChild(element);
    });
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'binarysearch-info';
    infoDiv.textContent = `Searching for: ${target}`;
    
    visualizationContainer.appendChild(arrayContainer);
    visualizationContainer.appendChild(infoDiv);
  }

  async function binarySearch() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    resetBtn.disabled = true;
    
    let left = 0;
    let right = array.length - 1;
    const elements = visualizationContainer.querySelectorAll('.binarysearch-element');
    const infoDiv = visualizationContainer.querySelector('.binarysearch-info');
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      elements.forEach(el => el.classList.remove('current'));
      elements[mid].classList.add('current');
      infoDiv.textContent = `Searching for ${target}: Checking element at index ${mid} (value ${array[mid]})`;
      currentStep++;
      updateProgress();
      await delay();
      
      if (array[mid] === target) {
        elements[mid].classList.remove('current');
        elements[mid].classList.add('found');
        infoDiv.textContent = `Found ${target} at index ${mid}!`;
        break;
      } else if (array[mid] < target) {
        for (let i = left; i <= mid; i++) {
          elements[i].classList.add('checked');
        }
        left = mid + 1;
      } else {
        for (let i = mid; i <= right; i++) {
          elements[i].classList.add('checked');
        }
        right = mid - 1;
      }
      
      currentStep++;
      updateProgress();
      await delay();
    }
    
    if (left > right) {
      infoDiv.textContent = `${target} not found in array!`;
    }
    
    isRunning = false;
    startBtn.disabled = false;
    resetBtn.disabled = false;
  }

  function resetSearch() {
    if (isRunning) return;
    initializeArray();
    currentStep = 0;
    updateProgress();
  }

  function updateProgress() {
    const percent = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
    document.getElementById('binarysearch-current-step').textContent = currentStep;
    document.getElementById('binarysearch-percent').textContent = `${percent}% Complete`;
    document.getElementById('binarysearch-progress').style.width = `${percent}%`;
  }

  function delay() {
    return new Promise(resolve => setTimeout(resolve, animationSpeed));
  }

  // Event listeners
  startBtn.addEventListener('click', binarySearch);
  resetBtn.addEventListener('click', resetSearch);
  sizeControl.addEventListener('input', function() {
    arraySize = parseInt(this.value);
    resetSearch();
  });
  speedControl.addEventListener('input', function() {
    animationSpeed = 550 - (this.value * 50);
  });

  // Initialize
  initializeArray();
});