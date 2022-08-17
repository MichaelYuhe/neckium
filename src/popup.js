import './popup.css';
import { sendMessageToContent } from './utils';

(function () {
  let isSetting = false;

  async function setUp() {
    await chrome.storage.local.set({ mode: 1 });
    await chrome.storage.local.set({ state: 'STOP' });

    let currMode = 1;

    const setupButton = document.getElementById('setup');
    setupButton.addEventListener('click', async () => {
      await chrome.storage.local.set({ state: 'SETUP' });
      sendMessageToContent('SETUP');
      if (!isSetting) sendMessageToContent('SETUP');
      isSetting = true;
    });

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', () => {
      if (isSetting) sendMessageToContent('SAVE');
      isSetting = false;
    });

    const startButton = document.getElementById('start');
    startButton.addEventListener('click', async () => {
      chrome.storage.local.get(['default'], (res) => {
        if (res.default.length === 0) {
          console.log('Set up default pose first.');
          return;
        }
      });
      await chrome.storage.local.set({ state: 'START' });
      sendMessageToContent('START');
    });

    const stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', async () => {
      await chrome.storage.local.set({ state: 'STOP' });
      sendMessageToContent('STOP');
    });

    const switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', async () => {
      currMode = -currMode;
      await chrome.storage.local.set({ mode: currMode });
      sendMessageToContent('SWITCH');
      const modeText = currMode === 1 ? 'Step' : 'Consistent';
      switchButton.innerText = modeText;
    });

    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', async () => {
      await chrome.storage.local.remove(['default'], (res) => {
        console.log(res);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setUp);
})();
