import PageHeader from '@/components/header/PageHeader';
import { RichTextParser } from '@/components/ui/RichTextParser';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';
import { fetchSanityData } from '@/lib/sanity/client';
import { getTermsOfUse } from '@/lib/sanity/queries';
import { PAGES } from '@/lib/Constants';
import { getPageMetadata, getStringDate } from '@/lib/utils';
import { TermsPrivacy } from '@/lib/types';
import {
  HiOutlineCalendarDays,
  HiOutlineChevronDoubleDown,
} from 'react-icons/hi2';
import CTAButton from '@/components/ui/CTA/CTAButton';

export const revalidate = 60;

export const metadata = getPageMetadata('terms');

const TermsOfUse = async () => {
  const data = await fetchSanityData(getTermsOfUse);
  const terms: TermsPrivacy = data.terms;

  const { lastUpdated, content } = terms;
  const { title, description } = PAGES.terms;

  return (
    <main>
      <PageHeader id='terms' title={title} paragraph={description}>
        <div className='flex items-center gap-1 text-2xl mt-4'>
          <HiOutlineCalendarDays className='text-primary' />
          <time className='text-xl'>{getStringDate(lastUpdated)}</time>
        </div>
        <div className='absolute left-1/2 -translate-x-1/2 bottom-8'>
          <CTAButton
            title='Scroll down'
            scrollId='content'
            style='ghost'
            className='text-3xl animate-bounce'
          >
            <HiOutlineChevronDoubleDown />
          </CTAButton>
        </div>
      </PageHeader>

      <LocomotiveScrollSection
        id='content'
        className='mx-auto w-full max-w-7xl px-4 py-20 md:px-8 2xl:px-0'
      >
        <RichTextParser title='Terms of Use' content={content} />
      </LocomotiveScrollSection>
    </main>
  );
};

export default TermsOfUse;
