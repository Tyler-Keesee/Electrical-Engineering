// Site navigation and resource rendering live in resourcemanager.js.
// Keep search logic separate so a missing optional module cannot block page loading.
function filterResources() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  const query = String(input.value || '').trim().toLocaleLowerCase();
  for (const card of document.querySelectorAll('.resource')) {
    const searchable = String(card.textContent || '').toLocaleLowerCase();
    card.style.display = !query || searchable.includes(query) ? '' : 'none';
  }
}

// Used by the existing inline Search button.
window.searchFunction = filterResources;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (input) input.addEventListener('input', filterResources);

  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', event => {
      event.preventDefault();
      const feedback = String(document.getElementById('feedback-text')?.value || '').trim();
      if (!feedback) return;
      const subject = encodeURIComponent('Electrical Engineering Learning Platform feedback');
      const body = encodeURIComponent(feedback.slice(0, 1500));
      window.location.href = 'mailto:rescuepcrepairs@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  const nav = document.querySelector('nav');
  if (nav) nav.addEventListener('click', () => {
    // Reapply the active filter after resource cards are re-rendered.
    window.requestAnimationFrame?.(filterResources);
  });
});
