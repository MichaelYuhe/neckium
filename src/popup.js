import './popup.css';

function sendMessageToContent(message) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      const messgae = {
        type: message,
      };
      chrome.tabs.sendMessage(tabs[0].id, messgae, (response) => {
        console.log(response);
      });
    }
  );
}

(function () {
  function setUp() {
    chrome.storage.local.set({ mode: 1 });
    let currMode = 1;

    const setupButton = document.getElementById('setup');
    setupButton.addEventListener('click', () => {
      sendMessageToContent('SETUP');
    });

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', () => {
      sendMessageToContent('SAVE');
    });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
      sendMessageToContent('START');
      chrome.storage.local.set({ state: 'START' });
    });

    const stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', () => {
      sendMessageToContent('STOP');
      chrome.storage.local.set({ state: 'STOP' });
    });

    const switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', async () => {
      currMode = -currMode;
      await chrome.storage.local.set({ mode: currMode });
      sendMessageToContent('SWITCH');
      switchButton.innerText = String(currMode);
    });
  }

  document.addEventListener('DOMContentLoaded', setUp);
})();
