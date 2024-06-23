'use client';
import { useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useShareURL from '@/lib/hooks/useShareURL';
import { COLLECTION } from '@/lib/types';
import { HiOutlineShare, HiPaperClip } from 'react-icons/hi2';

import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share';

import {
  RiFacebookBoxLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiMailLine,
  RiTelegramLine,
  RiTwitterXLine,
  RiWhatsappLine,
} from 'react-icons/ri';
import { CTALink } from '../ui/CTA/CTALink';

type Props = {
  collection: COLLECTION;
};

const ShareCollectionModal = ({ collection }: Props) => {
  const { title, slug } = collection;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const { currentURL, copyToClipboard } = useShareURL();

  const handleCopy = () => {
    copyToClipboard();
    closeBtn.current?.click();
  };

  const handleCancel = () => {
    closeBtn.current?.click();
  };

  return (
    <Modal
      closeBtn={closeBtn}
      CTA='Share'
      btnStyle='ghost'
      scrollId='collection-header'
      classNames='flex flex-col space-y-4'
      icon={<HiOutlineShare className='text-lg text-inherit' />}
    >
      <h3 className='w-fit text-primary text-lg lg:text-2xl font-bold tracking-wider'>
        Share <span className='italic'>{title}</span>
      </h3>

      <div className='my-4'>
        <label className='form-control flex-row w-full px-8'>
          <Input
            name='url'
            className='input input-bordered w-full'
            disabled={true}
            state={{ url: currentURL }}
          />
        </label>
        <div className='mx-auto grid place-items-center grid-cols-3 md:grid-cols-6 gap-4'>
          {socials.map(({ id, icon, ShareButton }) => {
            return (
              <ShareButton
                key={id}
                url={currentURL}
                className='tooltip'
                data-tip={id}
              >
                <CTAButton className='h-10 text-2xl'>{icon}</CTAButton>
              </ShareButton>
            );
          })}
        </div>
      </div>

      <div className={`pt-4 flex justify-end gap-2 md:gap-4 z-10`}>
        <CTAButton onClick={handleCopy} className='flex items-center gap-1'>
          <HiPaperClip />
          Clipboard
        </CTAButton>
        <CTAButton style='ghost' onClick={handleCancel}>
          Cancel
        </CTAButton>
      </div>
    </Modal>
  );
};

export default ShareCollectionModal;

const socials = [
  {
    id: 'email',
    icon: <RiMailLine />,
    ShareButton: EmailShareButton,
  },
  {
    id: 'facebook',
    icon: <RiFacebookBoxLine />,
    ShareButton: FacebookShareButton,
  },
  {
    id: 'linkedin',
    icon: <RiLinkedinBoxLine />,
    ShareButton: LinkedinShareButton,
  },
  {
    id: 'telegram',
    icon: <RiTelegramLine />,
    ShareButton: TelegramShareButton,
  },
  {
    id: 'twitter',
    icon: <RiTwitterXLine />,
    ShareButton: TwitterShareButton,
  },
  {
    id: 'whatsapp',
    icon: <RiWhatsappLine />,
    ShareButton: WhatsappShareButton,
  },
];
