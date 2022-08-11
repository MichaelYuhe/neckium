// Listen for horizonal moves to switch or create tab
chrome.runtime.onMessage.addListener((request, sender, response) => {
  console.log('request: ', request.type);
  if (request.type === 'RIGHT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log(tabs);
      const len = tabs.length;
      const currIndex = tabs.find((tab) => tab.active).index;
      if (currIndex === len - 1) {
        chrome.tabs.create();
      } else {
        chrome.tabs.highlight(tabs[index + 1]);
      }
    });
  } else if (request.type === 'LEFT') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log(tabs);
      const currIndex = tabs.find((tab) => tab.active).index;
      if (currIndex === 0) {
        chrome.tabs.create();
      } else {
        chrome.tabs.highlight(tabs[index - 1]);
      }
    });
  }
});
