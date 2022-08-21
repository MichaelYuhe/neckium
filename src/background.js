import { sendMessageToContent } from './utils';

chrome.storage.local.get('params', (res) => {
  if (!res) {
    chrome.storage.local.set({
      params: {
        scrollStep: 120,
        verticalQue: 4,
        horizontalQue: 30,
        verticalArea: 5,
        horizontalArea: 5,
      },
    });
  }
});

// Listen for horizonal moves to switch tabs
chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.type === 'RIGHT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const currTab = tabs.find((tab) => tab.active);
      if (currTab.index !== tabs.length - 1) {
        chrome.tabs.update(tabs[currTab.index + 1].id, { highlighted: true });
      }
    });
  } else if (request.type === 'LEFT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const currTab = tabs.find((tab) => tab.active);
      if (currTab.index !== 0) {
        chrome.tabs.update(tabs[currTab.index - 1].id, { highlighted: true });
      }
    });
  }
  response({});
});

chrome.tabs.onActivated.addListener(() => {
  setTimeout(() => {
    sendMessageToContent('ACTIVATE');
  }, 200);
});
