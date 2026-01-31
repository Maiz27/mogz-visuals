import { Metadata } from 'next';
import PageHeader from '@/components/header/PageHeader';
import Heading from '@/components/heading/Heading';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';
import About from '@/components/sections/About';
import CTAButton from '@/components/ui/CTA/CTAButton';
import TeamMember from '@/components/ui/TeamMember';
import EmptyState from '@/components/ui/EmptyState';
import { fetchSanityData } from '@/lib/sanity/client';
import { getTeamMembers } from '@/lib/sanity/queries';
import { getPageMetadata } from '@/lib/utils';
import { EMPTY_STATE, PAGES } from '@/lib/Constants';
import { TEAM_MEMBER } from '@/lib/types';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi2';

export const revalidate = 60;

export const metadata: Metadata = getPageMetadata('about');

const AboutPage = async () => {
  const team: TEAM_MEMBER[] = await fetchSanityData(getTeamMembers);
  const { title, paragraph } = PAGES.about;

  return (
    <main>
      <PageHeader id='header' title={title} paragraph={paragraph}>
        <div className='absolute left-1/2 -translate-x-1/2 bottom-8'>
          <CTAButton
            title='Scroll Down'
            scrollId='about'
            style='ghost'
            className='text-3xl animate-bounce'
          >
            <HiOutlineChevronDoubleDown />
          </CTAButton>
        </div>
      </PageHeader>

      <About />

      <LocomotiveScrollSection
        id='team'
        className='w-full min-h-screen flex flex-col justify-center items-center gap-40'
      >
        <div className='max-w-6xl px-8 md:text-center'>
          <Heading text='Meet the Team' />
          <p>
            We are a team of talented photographers and videographers dedicated
            to capturing the essence of your special moments, turning fleeting
            memories into timeless visuals that speak volumes.
          </p>
        </div>

        {team && team.length > 0 ? (
          <div className='py-20 w-full mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-8 2xl:gap-y-64 place-items-center'>
            {team.map((member, i) => (
              <TeamMember key={i} member={member} index={i} />
            ))}
          </div>
        ) : (
          <div className='py-20'>
            <EmptyState
              heading={EMPTY_STATE.team.heading}
              paragraph={EMPTY_STATE.team.paragraph}
            />
          </div>
        )}
      </LocomotiveScrollSection>
    </main>
  );
};

export default AboutPage;
