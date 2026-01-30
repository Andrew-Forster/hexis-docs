import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

function Table(props: React.ComponentProps<'table'>) {
  return (
    <div className="table-scroll-wrapper">
      <table {...props} />
    </div>
  );
}

export default {
  ...MDXComponents,
  table: Table,
};
