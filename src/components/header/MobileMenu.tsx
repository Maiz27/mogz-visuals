'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { Logo } from './Header';
import CTAButton from '../ui/CTA/CTAButton';
import { ByNilotik } from '../footer/Footer';
import AccessCollectionForm from '../forms/AccessCollectionForm';
import useMenu from '@/lib/hooks/useMenu';
import useFormState from '@/lib/hooks/useFormState';
import { setCollectionAccessCookie } from '@/lib/utils';
import useVerifyAccess from '@/lib/hooks/useVerifyAccess';
import { FORMS, ROUTES } from '@/lib/Constants';
import {
  HiArrowSmallRight,
  HiBars3BottomRight,
  HiMiniXMark,
} from 'react-icons/hi2';

const MobileMenu = () => {
  const { isOpen, menuRef, handleOpen, handleClose } = useMenu();

  const router = useRouter();

  const handleReroute = (response: any) => {
    setCollectionAccessCookie(response.encryptedSlug);
    router.push(`/private?slug=${response.slug}`);
    handleClose();
  };

  const handleMenuLinkClick = (href: string) => {
    router.push(href);
    handleClose();
  };

  return (
    <div className='block lg:hidden'>
      <button onClick={handleOpen} className='block text-4xl'>
        <HiBars3BottomRight />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className='fixed left-0 top-0 flex justify-between min-h-dvh w-full flex-col bg-copy text-background'
        >
          <div className='py-6 px-4'>
            <div className='flex items-center justify-between pb-6'>
              <Logo black={true} />
              <button onClick={handleClose}>
                <HiMiniXMark className='text-4xl' />
              </button>
            </div>
            <nav>
              <ul>
                {ROUTES.map(({ name, href }, index) => (
                  <MobileMenuLink
                    key={name}
                    href={href}
                    handleMenuLinkClick={handleMenuLinkClick}
                  >
                    {name}
                  </MobileMenuLink>
                ))}
              </ul>
            </nav>
          </div>

          <div className='flex flex-col px-4'>
            <AccessForm handleReroute={handleReroute} />
            <div className='flex items-center justify-end mt-8 mb-2'>
              <ByNilotik />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;

const MobileMenuLink = ({
  href,
  handleMenuLinkClick,
  children,
}: {
  href: string;
  handleMenuLinkClick: (href: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <li className='relative text-background'>
      <button
        onClick={() => handleMenuLinkClick(href)}
        className='flex w-full cursor-pointer items-center justify-between border-b border-neutral-300 py-6 text-start text-2xl font-semibold'
      >
        <span className='font-bold tracking-wider'>{children}</span>
        <HiArrowSmallRight />
      </button>
    </li>
  );
};

const AccessForm = ({ handleReroute }: { handleReroute: (r: any) => void }) => {
  const { initialValue, rules } = FORMS.browse;
  const { state, errors, handleChange, reset } = useFormState(
    initialValue,
    rules
  );

  const { response, loading, handleVerifyAccess } = useVerifyAccess();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await handleVerifyAccess(state);

    if (response.status === 200) {
      reset();
      handleReroute(response);
    }
  };

  return (
    <>
      <h3 className='text-lg font-bold tracking-wider mb-2'>
        Access Private Collection
      </h3>
      <AccessCollectionForm
        onSubmit={handleSubmit}
        state={state}
        errors={errors}
        handleChange={handleChange}
        className='flex flex-col justify-center space-y-4 text-copy'
      >
        {response && (
          <span
            className={`pt-4 ${
              response.status === 200 ? 'text-green-500' : 'text-red-600'
            }`}
          >
            {response.message}
          </span>
        )}

        <CTAButton type='submit' loading={loading} style='primary'>
          Access Collection
        </CTAButton>
      </AccessCollectionForm>
    </>
  );
};
