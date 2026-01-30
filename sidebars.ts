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
        'api/world',
        'api/spatial',
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

    // Actions & Combat
    {
      type: 'category',
      label: 'Actions & Combat',
      items: [
        'api/actions',
        'api/combat',
        'api/mining',
      ],
    },

    // GUI & Inventory
    {
      type: 'category',
      label: 'GUI & Inventory',
      items: [
        'api/gui',
        'api/inventory',
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

    // Advanced
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'api/opportunistic',
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
