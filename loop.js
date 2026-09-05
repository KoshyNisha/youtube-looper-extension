let loopStart = null;
let loopEnd = null;
let isLooping = false;

function getVideo() {
  return document.querySelector('video');
}

function handleTimeUpdate() {
  const video = getVideo();
  if (!video || !isLooping) return;

  if (loopEnd !== null && video.currentTime >= loopEnd) {
    video.currentTime = loopStart || 0;
  }
}

function initLoopListener() {
  const video = getVideo();
  if (video) {
    video.removeEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('timeupdate', handleTimeUpdate);
  }
}

// Wait until YouTube's control bar is actually built in the DOM
function injectUIWhenReady() {
  if (document.getElementById('yt-loop-container')) return;

  // Target YouTube's title/meta container
  const targetLocation = 
    document.querySelector('#above-the-fold #title') || 
    document.querySelector('#owner') ||
    document.querySelector('ytd-watch-metadata');

  if (!targetLocation) {
    setTimeout(injectUIWhenReady, 500);
    return;
  }

  const container = document.createElement('div');
  container.id = 'yt-loop-container';
  container.innerHTML = `
    <button id="btn-set-start">Set A</button>
    <button id="btn-set-end">Set B</button>
    <button id="btn-toggle-loop">Loop: OFF</button>
    <span id="loop-display">--:-- to --:--</span>
  `;

  targetLocation.appendChild(container);
  attachUIEventListeners();
  
  console.log('YouTube Loop controls successfully injected!');
}

function attachUIEventListeners() {
  const video = getVideo();

  document.getElementById('btn-set-start').addEventListener('click', () => {
    const v = getVideo();
    if (v) {
      loopStart = v.currentTime;
      updateDisplay();
    }
  });

  document.getElementById('btn-set-end').addEventListener('click', () => {
    const v = getVideo();
    if (v) {
      loopEnd = v.currentTime;
      updateDisplay();
    }
  });

  document.getElementById('btn-toggle-loop').addEventListener('click', () => {
    isLooping = !isLooping;
    const btn = document.getElementById('btn-toggle-loop');
    btn.innerText = `Loop: ${isLooping ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', isLooping);
    initLoopListener();
  });
}

function updateDisplay() {
  const display = document.getElementById('loop-display');
  const startStr = loopStart !== null ? loopStart.toFixed(1) + 's' : 'A';
  const endStr = loopEnd !== null ? loopEnd.toFixed(1) + 's' : 'B';
  display.innerText = `${startStr} - ${endStr}`;
}

// Handle initial load and SPA page transitions
document.addEventListener('yt-navigate-finish', () => {
  loopStart = null;
  loopEnd = null;
  isLooping = false;
  setTimeout(injectUIWhenReady, 1000);
});

// Run initial check
injectUIWhenReady();