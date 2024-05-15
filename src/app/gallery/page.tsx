import PageHeader from '@/components/header/PageHeader';
import CollectionGrid from '@/components/gallery/CollectionGrid';
import CollectionIdForm from '@/components/forms/CollectionIdForm';
import { PAGE_HEADERS } from '@/lib/Constants';

const page = () => {
  const { title, paragraph } = PAGE_HEADERS[0];

  return (
    <main>
      <PageHeader id='gallery' title={title} paragraph={paragraph}>
        <CollectionIdForm />
      </PageHeader>

      <CollectionGrid />
    </main>
  );
};

export default page;
