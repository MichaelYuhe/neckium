const posenet = require('@tensorflow-models/posenet');
require("@tensorflow/tfjs-backend-webgl");
require("@tensorflow/tfjs-backend-cpu");

const constraints = {
  audio: true,
  video: {
    height: 240,
    width: 320,
    facingMode: "user"
  }
};

const video = document.createElement('video')
video.width = 320
video.height = 240
video.style.position = 'absolute'
video.style.top = 0
video.style.zIndex = 2000
document.body.appendChild(video)

const verticalStep = 4
const scrollStep = 10
const horizonlStep = 5

let net = null;
let defaultPose = [], prevPose = [], currPose = [];

let settingInterval = null, detectingInterval = null

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request: ', request)
  switch (request.type) {
    case 'SETUP': setup(); break;
    case 'DONE': done(); break;
    case 'START': start(); break;
    case 'STOP': stop(); break;
    default: console.log('Invalid Message.'); break;
  }
  sendResponse({});
  return true;
});

async function init() {
  net = await posenet.load();
  console.log('net init: ', net)
};

async function setup() {
  await init()
  // const cachePose = chrome.storage.get('default')
  // console.log(cachePose)
  if (0) {

  }
  else {
    video.style.display = 'block';
    // set up default pose
    navigator.mediaDevices.getUserMedia(constraints)
      .then(async (stream) => {
        video.srcObject = stream;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video)
          }
        });
        video.play()

        async function capture() {
          const res = await net.estimateSinglePose(video);
          const pose = res.keypoints.slice(0, 5)
          defaultPose = pose
        };

        settingInterval = setInterval(async () => {
          await capture();
        }, 500);
      })
      .catch((err) => {
        console.log('err: ', err)
      });
  }
}

async function done() {
  clearInterval(settingInterval)
  video.style.display = 'none';
  console.log('Default Pose: ', defaultPose)
  prevPose = defaultPose
  // chrome.storage.local.set({ 'default': defaultPose });
}

async function start() {
  await init()
  if (!defaultPose) {
    console.log('Set Up Default Pose First.')
    return
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(async (stream) => {
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video)
        }
      });
      video.play()

      async function detect() {
        // Get Current Head Pose
        const res = await net.estimateSinglePose(video)
        currPose = res.keypoints.slice(0, 5)

        // Check Vertical and Horizonal Moves
        const horizonalRes = checkHorizonal()
        const verticalRes = checkVertical()

        if (horizonalRes === 1) {
          console.log('Move Right')
          handleRight()
        } else if (horizonalRes === -1) {
          console.log('Move Left')
          handleLeft()
        } else {
          if (verticalRes === 1) {
            console.log('Move Up')
            handleUp()
          }
          else if (verticalRes === -1) {
            console.log('Move Down')
            handleDown()
          }
          else {
            console.log('No Move')
          }
        }

        // Update Previous Pose
        prevPose = [...currPose]
      };

      detectingInterval = setInterval(async () => {
        await detect();
      }, 500);
    })
    .catch((err) => {
      console.log('err: ', err)
    });
}

async function stop() {
  clearInterval(detectingInterval)
}

function checkVertical() {
  const prevDiff = prevPose[0].position.y - currPose[0].position.y
  const defaultDiff = defaultPose[0].position.y - currPose[0].position.y
  if (prevDiff < -verticalStep && defaultDiff < -5) {
    return -1;
  } else if (prevDiff > verticalStep && defaultDiff > 5) {
    return 1;
  }
}

function checkHorizonal() { }

function handleUp() {
  window.scrollBy({
    top: -scrollStep,
    behavior: "smooth",
  });
};

function handleDown() {
  window.scrollBy({
    top: scrollStep,
    behavior: "smooth",
  });
};

function handleLeft() {

};

function handleRight() {

};
