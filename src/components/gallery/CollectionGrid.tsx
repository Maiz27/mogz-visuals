import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import CollectionFilter from './CollectionFilter';

const CollectionGrid = () => {
  return (
    <LocomotiveScrollSection id='collections' className='min-h-screen mb-20'>
      <CollectionFilter />
    </LocomotiveScrollSection>
  );
};

export default CollectionGrid;
