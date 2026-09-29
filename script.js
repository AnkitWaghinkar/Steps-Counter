let steps = 0;
let targetSteps = 50;
let isTracking = false;

const stepDisplay = document.getElementById('step-count');
const goalInput = document.getElementById('goal-input');
const goalDisplay = document.getElementById('goal-display');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status-text');
const stepDisplayContainer = document.getElementById('step-display-container');
const celebrationGif = document.getElementById('celebration-gif');

// SVG Circle Math Setup
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

if (circle) {
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;
}

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  if (window.gsap) {
    gsap.to(circle, { strokeDashoffset: offset, duration: 0.3, ease: "power1.out" });
  } else {
    circle.style.strokeDashoffset = offset;
  }
}

// Update target when user changes input value
goalInput.addEventListener('input', (e) => {
  targetSteps = parseInt(e.target.value) || 1;
  goalDisplay.textContent = targetSteps;
  updateProgressUI();
});

function updateProgressUI() {
  stepDisplay.textContent = steps;
  let percent = (steps / targetSteps) * 100;
  if (percent > 100) percent = 100;
  setProgress(percent);

  // Check if target is completed
  if (steps >= targetSteps && isTracking) {
    stepDisplayContainer.style.display = 'none';
    celebrationGif.style.display = 'block';
    statusText.textContent = 'Status: Goal Reached! 🎉';
  }
}

// Accelerometer Step Counting Logic
let lastMagnitude = 0;
const threshold = 1.2;
let lastStepTime = 0;
const debounceTime = 300;

function handleMotion(event) {
  if (!isTracking) return;

  const acc = event.accelerationIncludingGravity || event.acceleration;
  if (!acc) return;

  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const currentTime = Date.now();

  if (magnitude > threshold && lastMagnitude <= threshold) {
    if (currentTime - lastStepTime > debounceTime) {
      if (steps < targetSteps) {
        steps++;
        updateProgressUI();
      }
      lastStepTime = currentTime;
    }
  }
  lastMagnitude = magnitude;
}

// Toggle Tracking Start/Stop
toggleBtn.addEventListener('click', async () => {
  if (!isTracking) {
    // Request permission for iOS 13+ devices
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState !== 'granted') {
          alert('Permission denied for motion sensors.');
          return;
        }
      } catch (error) {
        console.error('Permission error:', error);
        alert('Could not get motion permission.');
        return;
      }
    }

    window.addEventListener('devicemotion', handleMotion, true);
    isTracking = true;
    toggleBtn.textContent = 'Stop';
    toggleBtn.style.backgroundColor = '#e84118';
    toggleBtn.style.color = '#f8f8f8';
    statusText.textContent = 'Status: Tracking Active...';
    goalInput.disabled = true;
  } else {
    stopTracking();
  }
});

function stopTracking() {
  window.removeEventListener('devicemotion', handleMotion, true);
  isTracking = false;
  toggleBtn.textContent = 'Start Tracking';
  toggleBtn.style.backgroundColor = '#f8f8f8';
  toggleBtn.style.color = '#000000';
  statusText.textContent = 'Status: Paused';
  goalInput.disabled = false;
}

// Reset Button Logic
resetBtn.addEventListener('click', () => {
  stopTracking();
  steps = 0;
  stepDisplayContainer.style.display = 'block';
  celebrationGif.style.display = 'none';
  setProgress(0);
  stepDisplay.textContent = '0';
  statusText.textContent = 'Status: Reset';
  goalInput.disabled = false;
});
