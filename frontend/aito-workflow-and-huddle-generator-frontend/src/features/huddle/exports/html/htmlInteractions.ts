export const huddleHtmlInteractions = `<script>
(() => {
  const page = document.querySelector('.segmented-huddle-page');
  if (!page) return;
  const tabs = Array.from(page.querySelectorAll('[data-section-target]'));
  const panels = Array.from(page.querySelectorAll('[data-section-panel]'));
  const previous = page.querySelector('[data-section-previous]');
  const next = page.querySelector('[data-section-next]');
  const indexLabel = page.querySelector('[data-section-index]');
  const nameLabel = page.querySelector('[data-section-name]');
  let activeIndex = 0;
  const showSection = (index) => {
    activeIndex = Math.max(0, Math.min(index, panels.length - 1));
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === activeIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === activeIndex));
    if (indexLabel) indexLabel.textContent = String(activeIndex + 1);
    if (nameLabel) nameLabel.textContent = tabs[activeIndex]?.textContent?.trim() || 'Overview';
    if (previous) previous.disabled = activeIndex === 0;
    if (next) next.disabled = activeIndex === panels.length - 1;
    page.scrollIntoView({ block: 'start' });
  };
  tabs.forEach((tab, index) => tab.addEventListener('click', () => showSection(index)));
  previous?.addEventListener('click', () => showSection(activeIndex - 1));
  next?.addEventListener('click', () => showSection(activeIndex + 1));

  const phaseButtons = Array.from(page.querySelectorAll('[data-phase-filter]'));
  const activities = Array.from(page.querySelectorAll('[data-activity-phase]'));
  const phaseTitle = page.querySelector('[data-selected-phase-title]');
  const phaseDescription = page.querySelector('[data-selected-phase-description]');
  const phaseCount = page.querySelector('[data-visible-activity-count]');
  const phaseEmpty = page.querySelector('[data-phase-empty]');
  const selectPhase = (button) => {
    const id = button.getAttribute('data-phase-filter');
    let visible = 0;
    phaseButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    activities.forEach((activity) => {
      const match = activity.getAttribute('data-activity-phase') === id;
      activity.hidden = !match;
      if (match) visible += 1;
    });
    if (phaseTitle) phaseTitle.textContent = button.getAttribute('data-phase-name') || '';
    if (phaseDescription) phaseDescription.textContent = button.getAttribute('data-phase-description') || 'Content unavailable';
    if (phaseCount) phaseCount.textContent = visible + ' ' + (visible === 1 ? 'activity' : 'activities');
    if (phaseEmpty) phaseEmpty.hidden = visible > 0;
  };
  phaseButtons.forEach((button) => button.addEventListener('click', () => selectPhase(button)));
  if (phaseButtons[0]) selectPhase(phaseButtons[0]);

  const toast = page.querySelector('[data-copy-toast]');
  page.querySelectorAll('[data-copy-prompt]').forEach((button) => button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy-prompt') || '';
    try { await navigator.clipboard.writeText(value); }
    catch {
      const area = document.createElement('textarea');
      area.value = value; area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    }
    if (toast) { toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1500); }
  }));
  showSection(0);
})();
</script>`;
