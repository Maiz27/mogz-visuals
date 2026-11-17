import WaxSeal from './WaxSeal';
import { INVITE } from '@/lib/invite';

/** The sign-off: the seal again, and love from the couple. */
const ClosingSection = () => (
  <section className='iv-sheet iv-paper-emerald flex flex-col items-center px-6 pb-36 text-center'>
    <div data-iv='rise' className='iv-rise w-[120px]'>
      <div className='iv-drop'>
        <WaxSeal sizes='120px' />
      </div>
    </div>

    <span className='iv-script mt-8 text-[2.6rem] leading-[1.2]'>
      <span data-iv='write' className='iv-write iv-gold -my-[0.2em] inline-block px-[0.3em] py-[0.2em]'>
        With love,
      </span>
    </span>
    <span className='iv-script whitespace-nowrap text-[clamp(2.4rem,10.5vw,3.2rem)] leading-[1.15]'>
      <span data-iv='write' className='iv-write iv-gold -my-[0.2em] inline-block px-[0.3em] py-[0.2em]'>
        {INVITE.couple.short[0]} <span className='iv-serif text-[0.42em] italic'>&amp;</span>{' '}
        {INVITE.couple.short[1]}
      </span>
    </span>
    <span data-iv='rise' className='iv-rise iv-caps mt-6 text-[10px] text-[var(--iv-gold)]'>
      {INVITE.date.long}
    </span>
  </section>
);

export default ClosingSection;
