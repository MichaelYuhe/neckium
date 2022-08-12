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
video.style.position = 'absolute';
video.style.top = 0;
video.style.zIndex = 2000;
video.style.display = 'none';

document.body.appendChild(video);

let mode = 1;
chrome.storage.local.get(['mode'], async (res) => {
  mode = res.mode;
  console.log('initial mode: ', mode);
});

// Que value
const verticalStep = 4;
const horizonlStep = 15;

// Scroll distance
const scrollStep = 180;
const consistentStep = 120;

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
      chrome.storage.local.get(['mode'], async (res) => {
        mode = res.mode;
        console.log('mode switched to: ', mode);
      });
      break;
    default:
      console.log('Invalid Message.');
      break;
  }
  sendResponse({});
  return true;
});

// Start automatically when the state is START
chrome.storage.local.get(['state'], async (res) => {
  if (res.state === 'START') {
    await start();
  }
});

// Init
async function init() {
  net = await posenet.load();
  let cachePose = [];
  chrome.storage.local.get(['default'], async (res) => {
    cachePose = res.default;
  });
  if (cachePose) {
    defaultPose = cachePose;
    prevPose = defaultPose;
  }
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
      }, 500);
    })
    .catch((err) => {
      console.log('err: ', err);
    });
}

// Save default pose
async function save() {
  if (!defaultPose.length) return;
  prevPose = defaultPose;
  await chrome.storage.local.set({ default: defaultPose });
  await chrome.storage.local.set({ state: 'STOP' });

  clearInterval(settingInterval);
  video.style.display = 'none';
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    video.srcObject = null;
  }
}

// Start Neckium
async function start() {
  if (!net) await init();

  if (!defaultPose.length) {
    console.log('Set Up Default Pose First.');
    await setup();
    return;
  }

  await chrome.storage.local.set({ state: 'START' });

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
        // Get Current Head Pose
        const res = await net.estimateSinglePose(video);
        currPose = res.keypoints.slice(0, 5);
        // Step mode
        if (mode === 1) {
          // Check Vertical and Horizonal Moves
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
      }, 500);
    })
    .catch((err) => {
      console.log('err: ', err);
    });
}

// Turn off camera and stop Neckium
async function stop() {
  await chrome.storage.local.set({ state: 'STOP' });

  clearInterval(detectingInterval);
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    video.srcObject = null;
  }
}

function checkVertical() {
  const prevDiff = prevPose[0].position.y - currPose[0].position.y;
  const defaultDiff = defaultPose[0].position.y - currPose[0].position.y;
  if (prevDiff < -verticalStep && defaultDiff < -5) {
    return -1;
  } else if (prevDiff > verticalStep && defaultDiff > 5) {
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
