import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';
import { Grid } from '@/components/footer/Footer';

export const revalidate = 60;

const Home = () => {
  return (
    <main>
      <ScrollHero />

      <About />

      <Services />

      <Contact />

      <Grid />
    </main>
  );
};

export default Home;
