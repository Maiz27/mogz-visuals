import Image from 'next/image';

type Props = {
  eyebrow?: string;
  title: string;
  /** `dark` sections take light foil; `light` (ivory) sections take deep foil. */
  tone: 'dark' | 'light';
};

const SectionTitle = ({ eyebrow, title, tone }: Props) => (
  <div className='flex flex-col items-center gap-3 text-center'>
    {eyebrow && (
      <span data-iv='rise' className='iv-rise iv-caps text-[10px] text-[var(--iv-accent)]'>
        {eyebrow}
      </span>
    )}
    <h2 className='iv-script text-[clamp(2.8rem,12vw,3.4rem)] leading-[1.15]'>
      <span
        data-iv='write'
        className={`iv-write -mx-[0.45em] -my-[0.35em] inline-block px-[0.45em] py-[0.35em] ${tone === 'dark' ? 'iv-gold' : 'iv-gold-deep'}`}
      >
        {title}
      </span>
    </h2>
    <div data-iv='rise' className='iv-rise relative mt-1 aspect-[1200/188] w-40'>
      <Image src='/imgs/wedding/divider.webp' alt='' fill sizes='160px' className='object-contain' />
    </div>
  </div>
);

export default SectionTitle;
