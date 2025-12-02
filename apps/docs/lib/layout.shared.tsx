import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <img
        src="https://cdn.simplist.blog/assets/simplist-text-icon.svg"
        alt="Simplist"
        width={120}
        height={24}
        className="h-4 w-auto dark:invert"
      />,
      url: 'https://docs.simplist.blog'
    },
  };
}
