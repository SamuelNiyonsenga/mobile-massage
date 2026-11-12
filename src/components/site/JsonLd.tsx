import { jsonLdString } from '@/lib/seo';

/** Structured data for search engines. Escaped so content can never break out of the script tag. */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
