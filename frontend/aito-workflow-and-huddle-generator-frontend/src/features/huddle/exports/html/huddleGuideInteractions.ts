/**
 * Behaviour for the downloadable Huddle guide: tab and Previous/Next navigation,
 * the clickable AI-in-Action stage cards, and prompt copy buttons. Mirrors the
 * Frontier Accelerator reference export so a downloaded guide behaves identically.
 */
export const huddleGuideInteractions = `<script>
(() => {
  const toast = document.getElementById('copyToast');
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1600);
  };

  document.querySelectorAll('.copy-button').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const value = button.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      showToast('Prompt copied');
    });
  });

  const sectionLabels = {
    overview: 'Overview',
    'best-practices': 'Share Your Experience',
    preparation: 'Preparation',
    practice: 'Explore & Practice',
    commit: 'Commit to Action',
    tool: 'AI Tools',
    resources: 'Resources',
    notes: 'Facilitator Notes',
  };

  document.querySelectorAll('.segmented-huddle-page').forEach((page) => {
    const tabs = Array.from(page.querySelectorAll('[data-section-target]'));
    const panels = Array.from(page.querySelectorAll('[data-section-panel]'));
    const previousButton = page.querySelector('[data-section-previous]');
    const nextButton = page.querySelector('[data-section-next]');
    const indexElement = page.querySelector('[data-section-index]');
    const nameElement = page.querySelector('[data-section-name]');
    let activeIndex = 0;

    const labelFor = (index) => {
      const tab = tabs[index];
      if (!tab) return 'Overview';
      const key = tab.getAttribute('data-section-target') || '';
      return sectionLabels[key] || tab.textContent.trim() || 'Overview';
    };

    const showSection = (nextIndex) => {
      activeIndex = Math.max(0, Math.min(nextIndex, panels.length - 1));
      tabs.forEach((tab, index) => {
        const isActive = index === activeIndex;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
      panels.forEach((panel, index) => panel.classList.toggle('is-active', index === activeIndex));
      if (indexElement) indexElement.textContent = String(activeIndex + 1);
      if (nameElement) nameElement.textContent = labelFor(activeIndex);
      if (previousButton instanceof HTMLButtonElement) {
        previousButton.disabled = activeIndex === 0;
      }
      if (nextButton instanceof HTMLButtonElement) {
        const isLastSection = activeIndex === panels.length - 1;
        nextButton.disabled = isLastSection;
        nextButton.textContent = isLastSection ? 'Complete' : labelFor(activeIndex + 1) + ' \\u2192';
      }
      page.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    tabs.forEach((tab, index) => tab.addEventListener('click', () => showSection(index)));

    page.querySelectorAll('[data-flow-target]').forEach((card) => {
      const navigate = () => {
        const target = card.getAttribute('data-flow-target');
        const targetIndex = tabs.findIndex((tab) => tab.getAttribute('data-section-target') === target);
        if (targetIndex >= 0) showSection(targetIndex);
      };
      card.addEventListener('click', navigate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate();
        }
      });
    });

    previousButton?.addEventListener('click', () => showSection(activeIndex - 1));
    nextButton?.addEventListener('click', () => showSection(activeIndex + 1));
    showSection(0);
  });
})();
</script>`;
