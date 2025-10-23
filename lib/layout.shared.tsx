import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Image src="https://cdn.simplist.blog/assets/simplist-text-icon.svg" alt="Simplist" width={120} height={24} className="dark:invert" />
    },
    githubUrl: "https://github.com/Steellgold/simplist.blog"
  };
}