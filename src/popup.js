import './popup.css';

(function () {
  let isSetting = false;

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

  async function setUp() {
    await chrome.storage.local.set({ mode: 1 });
    await chrome.storage.local.set({ state: 'STOP' });

    let currMode = 1;

    const setupButton = document.getElementById('setup');
    setupButton.addEventListener('click', () => {
      chrome.storage.local.get(['state'], async (res) => {
        if (res.state === 'STOP') {
          await chrome.storage.local.set({ state: 'SETUP' });
          sendMessageToContent('SETUP');
        }
      });
      if (!isSetting) sendMessageToContent('SETUP');
      isSetting = true;
    });

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', () => {
      if (isSetting) sendMessageToContent('SAVE');
      isSetting = false;
    });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
      chrome.storage.local.get(['state'], async (res) => {
        if (res.state === 'STOP') {
          await chrome.storage.local.set({ state: 'START' });
          sendMessageToContent('START');
        }
      });
    });

    const stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', () => {
      chrome.storage.local.get(['state'], async (res) => {
        if (res.state === 'START') {
          await chrome.storage.local.set({ state: 'STOP' });
          sendMessageToContent('STOP');
        }
      });
    });

    const switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', async () => {
      currMode = -currMode;
      await chrome.storage.local.set({ mode: currMode });
      sendMessageToContent('SWITCH');
      const modeText = currMode === 1 ? 'Step' : 'Consistent';
      switchButton.innerText = modeText;
    });
  }

  document.addEventListener('DOMContentLoaded', setUp);
})();
