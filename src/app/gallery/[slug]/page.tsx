import CollectionHeader from '@/components/gallery/CollectionHeader';
import Gallery from '@/components/gallery/Gallery';

const page = () => {
  return (
    <main className='min-h-screen'>
      <CollectionHeader />

      <Gallery />
    </main>
  );
};

export default page;
