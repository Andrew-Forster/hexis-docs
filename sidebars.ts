import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    // Getting Started
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'intro',
        'getting-started/installation',
        'script-lifecycle',
        'quick-reference',
      ],
    },

    // Core APIs
    {
      type: 'category',
      label: 'Core',
      collapsed: false,
      items: [
        'api/core',
        'utilities/logging',
        'utilities/timer',
        'utilities/variables',
        'utilities/formatting',
      ],
    },

    // Player & World
    {
      type: 'category',
      label: 'Player & World',
      items: [
        'api/player',
        'api/inventory',
        'api/world',
        'api/conditions',
      ],
    },

    // Navigation & Movement
    {
      type: 'category',
      label: 'Navigation',
      items: [
        'api/navigation',
        'api/movement',
        'api/routes',
      ],
    },

    // Combat & Mining
    {
      type: 'category',
      label: 'Combat & Mining',
      items: [
        'api/combat',
        'api/mining',
      ],
    },

    // GUI & HUD
    {
      type: 'category',
      label: 'GUI & HUD',
      items: [
        'api/gui',
        'api/hud',
      ],
    },

    // Events & Communication
    {
      type: 'category',
      label: 'Events & Chat',
      items: [
        'api/events',
        'api/chat',
      ],
    },

    // Libraries
    {
      type: 'category',
      label: 'Libraries',
      items: [
        'api/libraries',
      ],
    },

    // Guides
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/best-practices',
        'guides/error-handling',
      ],
    },
  ],
};

export default sidebars;
