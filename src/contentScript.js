const posenet = require('@tensorflow-models/posenet');
require('@tensorflow/tfjs-backend-webgl');
require('@tensorflow/tfjs-backend-cpu');

// User media constraints
const constraints = {
  audio: false,
  video: {
    width: 320,
    height: 240,
    facingMode: 'user',
  },
};

// Video params
const video = document.createElement('video');
video.width = 320;
video.height = 240;
video.style.position = 'fixed';
video.style.top = 0;
video.style.left = 0;
video.style.zIndex = 2000;
video.style.display = 'none';

document.body.appendChild(video);

let isRunning = false;

let mode = 1;
chrome.storage.local.get(['mode'], async (res) => {
  mode = res.mode || 1;
});

// Que value
const verticalStep = 4;
const horizonlStep = 30;

// Detect interval
const interval = 200;

// Scroll distance
const scrollStep = 240;

let net = null;

let defaultPose = [],
  prevPose = [],
  currPose = [];

let settingInterval = null,
  detectingInterval = null;

// Listen for control messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request: ', request.type);
  switch (request.type) {
    case 'SETUP':
      setup();
      break;
    case 'SAVE':
      save();
      break;
    case 'START':
      start();
      break;
    case 'STOP':
      stop();
      break;
    case 'SWITCH':
      chrome.storage.local.get(['mode'], (res) => {
        mode = res.mode;
      });
      break;
    case 'ACTIVATE':
      chrome.storage.local.get(['state'], (res) => {
        if (res.state === 'START') {
          if (!isRunning) start();
        } else if (res.start === 'STOP') {
          if (isRunning) stop();
        }
      });
    default:
      console.log('Invalid Message.');
      break;
  }
  sendResponse({});
  return true;
});

// Start automatically when the state is START
chrome.storage.local.get(['state'], (res) => {
  if (res.state === 'START') {
    start();
  }
});

// Init
async function init() {
  net = await posenet.load();
}

// Setup default pose
async function setup() {
  if (!net) await init();

  await chrome.storage.local.set({ state: 'SETUP' });

  video.style.display = 'block';

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(async (stream) => {
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
      video.play();

      async function capture() {
        const res = await net.estimateSinglePose(video);
        const pose = res.keypoints.slice(0, 5);
        defaultPose = pose;
      }

      settingInterval = setInterval(async () => {
        await capture();
      }, 100);
    })
    .catch((err) => {
      console.log('err: ', err);
    });
}

// Turn off camera and save default pose
async function save() {
  if (!defaultPose.length) return;
  await chrome.storage.local.set({ default: defaultPose });
  await chrome.storage.local.set({ state: 'STOP' });

  settingInterval && clearInterval(settingInterval);
  turnOff();
}

// Start Neckium
async function start() {
  if (!net) await init();

  await chrome.storage.local.get(['default'], (res) => {
    console.log('default pose: ', res.default);
    if (res.default && res.default.length) {
      defaultPose = res.default;
      prevPose = defaultPose;
    } else {
      console.log('Set Up Default Pose First.');
      return;
    }
  });

  await chrome.storage.local.set({ state: 'START' });
  isRunning = true;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(async (stream) => {
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
      video.play();

      async function detect() {
        const res = await net.estimateSinglePose(video);
        currPose = res.keypoints.slice(0, 5);

        if (mode === 1) {
          const horizonalRes = checkHorizonal();
          const verticalRes = checkVertical();

          if (horizonalRes === 1) {
            console.log('Move Right');
            handleRight();
          } else if (horizonalRes === -1) {
            console.log('Move Left');
            handleLeft();
          } else {
            if (verticalRes === 1) {
              console.log('Move Up');
              handleUp();
            } else if (verticalRes === -1) {
              console.log('Move Down');
              handleDown();
            } else {
              console.log('No Move');
            }
          }
          prevPose = [...currPose];
        } else if (mode === -1) {
          const horizonalRes = checkHorizonal();
          const position = checkPosition();

          if (horizonalRes === 1) {
            console.log('Move Right');
            handleRight();
          } else if (horizonalRes === -1) {
            console.log('Move Left');
            handleLeft();
          } else {
            if (position === 1) {
              console.log('Move Down');
              handleDown();
            } else if (position === -1) {
              console.log('Move Up');
              handleUp();
            } else {
              console.log('No Move');
            }
          }
        }
      }

      detectingInterval = setInterval(async () => {
        await detect();
      }, 400);
    })
    .catch((err) => {
      console.log('err: ', err);
    });
}

// Turn off camera and stop Neckium
async function stop() {
  await chrome.storage.local.set({ state: 'STOP' });
  isRunning = false;

  settingInterval && clearInterval(settingInterval);
  detectingInterval && clearInterval(detectingInterval);
  turnOff();
}

function checkVertical() {
  const prevDiff = prevPose[0].position.y - currPose[0].position.y;
  const defaultDiff = defaultPose[0].position.y - currPose[0].position.y;
  if (prevDiff < -verticalStep && defaultDiff < -5) {
    return -1;
  } else if (prevDiff > verticalStep && defaultDiff > 3) {
    return 1;
  }
  return 0;
}

function checkHorizonal() {
  const prevDiff = prevPose[0].position.x - currPose[0].position.x;
  const defaultDiff = defaultPose[0].position.x - currPose[0].position.x;
  if (prevDiff < -horizonlStep && defaultDiff < -5) {
    return -1;
  } else if (prevDiff > horizonlStep && defaultDiff > 5) {
    return 1;
  }
  return 0;
}

function checkPosition() {
  if (currPose[0].position.y > defaultPose[0].position.y + 20) {
    return 1;
  } else if (currPose[0].position.y < defaultPose[0].position.y - 20) {
    return -1;
  }
}

function handleUp() {
  window.scrollBy({
    top: -scrollStep,
    behavior: 'smooth',
  });
}

function handleDown() {
  window.scrollBy({
    top: scrollStep,
    behavior: 'smooth',
  });
}

function handleLeft() {
  chrome.runtime.sendMessage(
    {
      type: 'LEFT',
    },
    (response) => {
      console.log(response);
    }
  );
}

function handleRight() {
  chrome.runtime.sendMessage(
    {
      type: 'RIGHT',
    },
    (response) => {
      console.log(response);
    }
  );
}

function turnOff() {
  video.style.display = 'none';
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    video.srcObject = null;
  }
}
