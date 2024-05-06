import Header from '@/components/header/Header';
import ScrollHero from '@/components/sections/ScrollHero';

export default function Home() {
  return (
    <main data-scroll-container className=''>
      <Header />
      <ScrollHero />

      <div id='about' className='min-h-screen'></div>
      <div id='services' className='min-h-screen'></div>
      <div id='contact' className='min-h-screen'></div>
    </main>
  );
}
