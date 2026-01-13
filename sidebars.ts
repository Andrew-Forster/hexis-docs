import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'script-lifecycle',
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/core',
        'api/player',
        'api/world',
        'api/navigation',
        'api/combat',
        'api/gui',
        'api/inventory',
        'api/actions',
        'api/events',
        'api/conditions',
        'api/hud',
        'api/routes',
        'api/mining',
        'api/movement',
        'api/spatial',
        'api/opportunistic',
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        'utilities/timer',
        'utilities/formatting',
        'utilities/logging',
        'utilities/variables',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/best-practices',
        'guides/error-handling',
      ],
    },
    'quick-reference',
  ],
};

export default sidebars;