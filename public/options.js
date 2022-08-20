(async function () {
  const params = await chrome.storage.local.get('params');
  console.log(params);

  const scrollStepInput = document.getElementById('scroll-step');
  scrollStepInput.addEventListener('input', (e) => {
    params.scrollStep = e.target.value;
  });

  const verticalQue = document.getElementById('vertical-que');
  verticalQue.addEventListener('input', (e) => {
    params.verticalQue = e.target.value;
  });

  const horizontalQue = document.getElementById('horizontal-que');
  horizontalQue.addEventListener('input', (e) => {
    params.horizontalQue = e.target.value;
  });

  const verticalInput = document.getElementById('vertical-area');
  verticalInput.addEventListener('input', (e) => {
    params.verticalArea = e.target.value;
  });

  const horizontalInput = document.getElementById('horizontal-area');
  horizontalInput.addEventListener('input', (e) => {
    params.horizontalArea = e.target.value;
  });

  const saveButton = document.getElementById('save');
  saveButton.addEventListener('click', () => {
    console.log(params);
    chrome.storage.local.set({ params: params });
  });
})();
