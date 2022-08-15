// Listen for horizonal moves to switch tabs
chrome.runtime.onMessage.addListener((request, sender, response) => {
  console.log('Background received request: ', request.type);
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
  } else {
    console.log('Invalid Request: ', request.type);
  }
  response({});
});
