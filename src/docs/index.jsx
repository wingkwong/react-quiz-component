const container = document.getElementById('app');

// These imports share bundle.js but only execute on their respective pages.
// The gallery and default UI never request MUI's CDN dependencies.
const example = container?.dataset.example;
const load = example === 'mui'
  ? import('./examples/mui/main')
  : example === 'default-ui'
    ? import('./examples/default-ui/main')
    : null;

load?.catch(() => {
  container.textContent = 'Unable to load this example. Check your connection and refresh the page.';
});
