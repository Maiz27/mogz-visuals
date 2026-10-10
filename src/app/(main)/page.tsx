import ImmersiveAbout from '@/components/sections/ImmersiveAbout';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';

// Sanity edits arrive through the webhook (/api/revalidate); this daily refresh
// is only a safety net for a missed delivery.
export const revalidate = 86400;

const Home = () => {
  return (
    <main>
      <ScrollHero />

      <ImmersiveAbout />

      <Services />

      <Contact />
    </main>
  );
};

export default Home;
