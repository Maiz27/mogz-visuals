import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';

export default function Home() {
  return (
    <main>
      <ScrollHero />

      <About />

      <Services />

      <Contact />
    </main>
  );
}
