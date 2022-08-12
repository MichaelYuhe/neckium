import './popup.css';

(function () {
  function setUp() {
    const setupButton = document.getElementById('setup');
    setupButton.addEventListener('click', () => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const messgae = {
            type: 'SETUP',
          };
          chrome.tabs.sendMessage(tabs[0].id, messgae, (response) => {
            console.log(response);
          });
        }
      );
    });

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', () => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const messgae = {
            type: 'SAVE',
          };
          chrome.tabs.sendMessage(tabs[0].id, messgae, (response) => {
            console.log(response);
          });
        }
      );
    });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const message = {
            type: 'START',
          };
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            console.log(response);
          });
        }
      );
      chrome.storage.local.set({ state: 'START' });
    });

    const stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', () => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const message = {
            type: 'STOP',
          };
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            console.log(response);
          });
        }
      );
      chrome.storage.local.set({ state: 'STOP' });
    });

    const switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', async () => {
      let mode = chrome.storage.local.get('mode');
      if (!mode) {
        mode = -1;
      } else {
        mode = -mode;
      }
      chrome.storage.local.set({ mode: mode });
      switchButton.innerHTML = mode;
    });
  }

  document.addEventListener('DOMContentLoaded', setUp);
})();
