import PageHeader from '@/components/header/PageHeader';
import { CTALink } from '@/components/ui/CTA/CTALink';
import { PAGE_HEADERS } from '@/lib/Constants';

export const Default404 = () => {
  const { title, paragraph } = PAGE_HEADERS[1];
  return (
    <>
      <PageHeader id='default404' title={title} paragraph={paragraph}>
        <div className='pt-4'>
          <CTALink href='/'>Return to Homepage</CTALink>
        </div>
      </PageHeader>
    </>
  );
};

export const Collection404 = () => {
  const { title, paragraph } = PAGE_HEADERS[1];
  return (
    <>
      <PageHeader id='collection404' title={title} paragraph={paragraph}>
        <div className='pt-8 flex flex-col md:flex-row items-center gap-4 '>
          <CTALink href='/gallery'>Browse Gallery</CTALink>
          <CTALink href='/gallery' style='ghost'>
            Return to Home
          </CTALink>
        </div>
      </PageHeader>
    </>
  );
};
