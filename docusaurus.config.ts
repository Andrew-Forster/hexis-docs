import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Hexis Documentation',
  tagline: 'Lua scripting API for intelligent Minecraft automation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.usehexis.com',
  baseUrl: '/',

  organizationName: 'hexis',
  projectName: 'hexis-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at root
        },
        blog: false, // Disable blog for pure docs site
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/hexis-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Docs',
      logo: {
        alt: 'Hexis Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          to: '/guides/best-practices',
          label: 'Guides',
          position: 'left',
        },
        {
          href: 'https://discord.gg/TNVyFgBqYz',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://usehexis.com',
          label: 'Website',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'API Reference',
              to: '/api/core',
            },
            {
              label: 'Guides',
              to: '/guides/best-practices',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/TNVyFgBqYz',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Main Website',
              href: 'https://usehexis.com',
            },
            {
              label: 'Quick Reference',
              to: '/quick-reference',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} A5 Software LLC. Not affiliated with Mojang AB or Hypixel Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['lua'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;