import Header from '@/components/header/Header';
import About from '@/components/sections/About';
import ScrollHero from '@/components/sections/ScrollHero';

export default function Home() {
  return (
    <main>
      <Header />

      <ScrollHero />

      <About />
      <div id='services' className='min-h-screen'></div>
      <div id='contact' className='min-h-screen'></div>
    </main>
  );
}
