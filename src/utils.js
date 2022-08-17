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

export { sendMessageToContent };
