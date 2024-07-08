import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';

export const revalidate = 60;

const Home = () => {
  return (
    <main>
      <ScrollHero />

      <About />

      <Services />

      <Contact />
    </main>
  );
};

export default Home;
