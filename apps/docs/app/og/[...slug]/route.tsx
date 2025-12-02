import { getPageImage, source } from '@/lib/source';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    (
      <DefaultImage
        title={page.data.title}
        description={page.data.description}
        site="Simplist"
        icon={
          <img
            src="https://cdn.simplist.blog/assets/simplist-text-icon.svg"
            alt="Simplist"
            width={100}
            height={100}
          />
        }
        primaryColor="#f6c44f"
        primaryTextColor="#3a2a1a"
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
