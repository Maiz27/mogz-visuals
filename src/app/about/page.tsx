import About from '@/components/sections/About';
import { getPageMetadata } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = getPageMetadata('about');

const AboutPage = () => {
  return (
    <main>
      <About />
    </main>
  );
};

export default AboutPage;
