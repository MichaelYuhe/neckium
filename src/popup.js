import './popup.css';

(function () {
  function setUp() {
    document.getElementById('setup').addEventListener('click', () => {
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

    document.getElementById('save').addEventListener('click', () => {
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

    document.getElementById('start').addEventListener('click', () => {
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

    document.getElementById('stop').addEventListener('click', () => {
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
  }
  document.addEventListener('DOMContentLoaded', setUp);
})();
