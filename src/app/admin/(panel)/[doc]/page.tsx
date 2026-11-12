import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DOCS, isDocKey } from '@/lib/cms/schemas';
import { getDoc, hasUnpublished, listHistory } from '@/lib/cms/store';
import Editor from './Editor';

export default async function EditDoc({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!isDocKey(doc)) notFound();
  const def = DOCS[doc];

  const [data, unpublished, history] = await Promise.all([
    getDoc<Record<string, unknown>>(doc, 'draft'),
    hasUnpublished(doc),
    listHistory(doc),
  ]);

  return (
    <main className="adm-main adm-main--wide">
      <p className="adm-crumb">
        <Link href="/admin">Content</Link> / {def.title}
      </p>
      <Editor
        docKey={doc}
        title={def.title}
        viewPath={def.viewPath}
        fields={def.fields}
        initialData={data}
        initialUnpublished={unpublished}
        initialHistory={history}
      />
    </main>
  );
}
