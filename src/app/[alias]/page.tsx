'use server';

import { findLinkByShortCode, incrementClickCount } from '@/lib/data';
import { redirect } from 'next/navigation';
import NotFoundPage from './not-found-page';

export default async function ShortLinkPage({ params }: { params: { alias: string } }) {
  const link = await findLinkByShortCode(params.alias);

  if (link) {
    await incrementClickCount(params.alias);
    redirect(link.longUrl);
  } else {
    return <NotFoundPage />;
  }
}
