import Header from '@/components/header/Header';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import Services from '@/components/sections/Services';
import ScrollHero from '@/components/sections/ScrollHero';
import Footer from '@/components/footer/Footer';

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <ScrollHero />

        <About />

        <Services />

        <Contact />
      </main>

      <Footer />
    </>
  );
}
