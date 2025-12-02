import { getPageImage, source } from '@/lib/source';
import { generate as DefaultImage } from 'fumadocs-ui/og';
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
        icon={
          <img
            src="https://cdn.simplist.blog/assets/Simplist4060.png"
            alt="Simplist"
            width={40}
            height={60}
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
