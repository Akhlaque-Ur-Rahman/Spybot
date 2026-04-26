import { getSiteRuntimeConfig } from '@/lib/cms/service';
import { NotFoundView } from '@/components/NotFoundView';

export default async function SiteNotFound() {
  const site = await getSiteRuntimeConfig();
  return <NotFoundView brand={site.siteName} variant="overlay" />;
}
