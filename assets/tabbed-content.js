class TabbedContent extends HTMLElement {
  constructor() {
    super();
    this.tablist = this.querySelector('[role="tablist"]');
    this.panelsContainer = this.querySelector('.tabbed-content__panels');
    this.tabBlocks = this.querySelectorAll('.tabbed-content__tab-block');

    this.init();
  }

  init() {
    if (!this.tablist || !this.panelsContainer || !this.tabBlocks.length) return;

    // Move tab buttons and panels to their correct containers
    this.organizeTabElements();

    // Get organized tabs and panels
    this.tabs = this.querySelectorAll('[role="tab"]');
    this.panels = this.querySelectorAll('[role="tabpanel"]');
    this.isVertical = this.tablist?.getAttribute('aria-orientation') === 'vertical';

    if (!this.tabs.length || !this.panels.length) return;

    // Set initial active tab
    const initialTab = parseInt(this.getAttribute('initial-tab') || '0');
    this.setActiveTab(initialTab);

    // Add event listeners
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.setActiveTab(index));
      tab.addEventListener('keydown', (e) => this.handleKeydown(e, index));
    });
  }

  organizeTabElements() {
    // Sort tab blocks by their data-tab-index to maintain order
    const sortedTabBlocks = Array.from(this.tabBlocks).sort((a, b) => {
      return parseInt(a.dataset.tabIndex) - parseInt(b.dataset.tabIndex);
    });

    sortedTabBlocks.forEach((tabBlock) => {
      const tabButton = tabBlock.querySelector('[data-tab-button]');
      const tabPanel = tabBlock.querySelector('[data-tab-panel]');

      if (tabButton && tabPanel) {
        // Move tab button to tablist
        this.tablist.appendChild(tabButton);

        // Move tab panel to panels container
        this.panelsContainer.appendChild(tabPanel);
      }
    });

    // Remove now-empty tab blocks
    this.tabBlocks.forEach(block => block.remove());
  }

  setActiveTab(index) {
    // Ensure index is within bounds
    if (index < 0 || index >= this.tabs.length) return;

    // Update tabs
    this.tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', isActive);
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.classList.toggle('tabbed-content__tab--active', isActive);

      if (isActive) {
        tab.focus();
      }
    });

    // Update panels
    this.panels.forEach((panel, i) => {
      const isActive = i === index;
      panel.classList.toggle('tabbed-content__panel--active', isActive);

      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  handleKeydown(event, currentIndex) {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        if (!this.isVertical) {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        }
        break;
      case 'ArrowRight':
        if (!this.isVertical) {
          event.preventDefault();
          newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'ArrowUp':
        if (this.isVertical) {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        }
        break;
      case 'ArrowDown':
        if (this.isVertical) {
          event.preventDefault();
          newIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.tabs.length - 1;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.setActiveTab(currentIndex);
        return;
    }

    if (newIndex !== currentIndex) {
      this.setActiveTab(newIndex);
    }
  }
}

// Register the custom element
if (!customElements.get('tabbed-content')) {
  customElements.define('tabbed-content', TabbedContent);
}