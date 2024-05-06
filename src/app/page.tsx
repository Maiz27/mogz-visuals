import Header from '@/components/header/Header';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';

export default function Home() {
  return (
    <main>
      <Header />

      <ScrollHero />

      <About />

      <Services />

      <Contact />
    </main>
  );
}
