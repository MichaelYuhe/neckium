(async function () {
  const scrollStepInput = document.getElementById('scroll-step');
  const verticalQue = document.getElementById('vertical-que');
  const horizontalQue = document.getElementById('horizontal-que');
  const verticalArea = document.getElementById('vertical-area');
  const horizontalArea = document.getElementById('horizontal-area');
  const saveButton = document.getElementById('save');

  const params = (await chrome.storage.local.get('params')).params || {};

  scrollStepInput.value = params?.scrollStep || 120;
  verticalQue.value = params?.verticalQue || 5;
  horizontalQue.value = params?.horizontalQue || 30;
  verticalArea.value = params?.verticalArea || 5;
  horizontalArea.value = params?.horizontalArea || 5;

  scrollStepInput.addEventListener('input', (e) => {
    params.scrollStep = e.target.value;
  });

  verticalQue.addEventListener('input', (e) => {
    params.verticalQue = e.target.value;
  });

  horizontalQue.addEventListener('input', (e) => {
    params.horizontalQue = e.target.value;
  });

  verticalArea.addEventListener('input', (e) => {
    params.verticalArea = e.target.value;
  });

  horizontalArea.addEventListener('input', (e) => {
    params.horizontalArea = e.target.value;
  });

  saveButton.addEventListener('click', async () => {
    await chrome.storage.local.set({ params: params });
  });
})();
