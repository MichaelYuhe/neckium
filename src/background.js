// Listen for horizonal moves to switch or create tab
chrome.runtime.onMessage.addListener((request, sender, response) => {
  console.log('Background received request: ', request.type);
  if (request.type === 'RIGHT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const len = tabs.length;
      const currTab = tabs.find((tab) => tab.active);
      console.log(tabs);
      console.log(currTab);
      console.log('Current tab index: ', currTab.index);
      if (currIndex === len - 1) {
        // chrome.tabs.create();
      } else {
        chrome.tabs.highlight(tabs[index + 1]);
      }
    });
  } else if (request.type === 'LEFT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const currIndex = tabs.find((tab) => tab.active).index;
      console.log('Current tab index: ', currIndex);
      if (currIndex === 0) {
        // chrome.tabs.create();
      } else {
        chrome.tabs.highlight(tabs[index - 1]);
      }
    });
  }
  response({});
});
