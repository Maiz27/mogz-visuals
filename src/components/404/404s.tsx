import PageHeader from '@/components/header/PageHeader';
import { CTALink } from '@/components/ui/CTA/CTALink';
import { PAGE_HEADERS } from '@/lib/Constants';

export const Default404 = () => {
  const { title, paragraph } = PAGE_HEADERS[2];
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
