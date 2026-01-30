import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof FooterType>;

function InlineDocFooter() {
  return (
    <div className="doc-footer-inline">
      <div className="doc-footer-inline__content">
        <div className="doc-footer-inline__section">
          <div className="doc-footer-inline__title">Documentation</div>
          <ul className="doc-footer-inline__links">
            <li><a href="/">Getting Started</a></li>
            <li><a href="/api/core">API Reference</a></li>
            <li><a href="/guides/best-practices">Guides</a></li>
          </ul>
        </div>
        <div className="doc-footer-inline__section">
          <div className="doc-footer-inline__title">Community</div>
          <ul className="doc-footer-inline__links">
            <li><a href="https://discord.gg/TNVyFgBqYz" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
        <div className="doc-footer-inline__section">
          <div className="doc-footer-inline__title">More</div>
          <ul className="doc-footer-inline__links">
            <li><a href="https://usehexis.com" target="_blank" rel="noopener noreferrer">Main Website</a></li>
            <li><a href="/quick-reference">Quick Reference</a></li>
          </ul>
        </div>
      </div>
      <div className="doc-footer-inline__copyright">
        Copyright © {new Date().getFullYear()} A5 Software LLC. Not affiliated with Mojang AB or Hypixel Inc.
      </div>
    </div>
  );
}

export default function FooterWrapper(props: Props): JSX.Element {
  return (
    <>
      <Footer {...props} />
      <InlineDocFooter />
    </>
  );
}