'use client';

import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useShareURL from '@/lib/hooks/useShareURL';
import { COLLECTION } from '@/lib/types';
import { HiPaperClip } from 'react-icons/hi2';

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
  RiLinkedinBoxLine,
  RiMailLine,
  RiTelegramLine,
  RiTwitterXLine,
  RiWhatsappLine,
} from 'react-icons/ri';

type Props = {
  onClose: () => void;
  collection: COLLECTION;
};

const ShareContent = ({ onClose, collection }: Props) => {
  const { title } = collection;
  const { currentURL, copyToClipboard } = useShareURL();

  const handleCopy = () => {
    copyToClipboard();
    onClose();
  };

  return (
    <div className='flex flex-col space-y-6 pt-4'>
      <label className='form-control w-full'>
        <div className='label'>
          <span className='label-text'>Page URL</span>
        </div>
        <div className='flex gap-2'>
          <Input
            name='url'
            className='input input-bordered w-full'
            disabled={true}
            state={{ url: currentURL }}
          />
          <CTAButton
            onClick={handleCopy}
            className='shrink-0'
            title='Copy to Clipboard'
          >
            <HiPaperClip className='text-xl' />
          </CTAButton>
        </div>
      </label>

      <div className='grid grid-cols-3 gap-6 place-items-center py-6'>
        {socials.map(({ id, icon, ShareButton }) => (
          <div key={id} className='flex flex-col items-center gap-2'>
            <ShareButton
              url={currentURL}
              className='transition-transform active:scale-95 hover:scale-110'
            >
              <div className='bg-white/5 p-4 rounded-full text-3xl text-copy hover:text-primary transition-colors border border-white/10 hover:border-primary/50'>
                {icon}
              </div>
            </ShareButton>
            <span className='text-xs text-copy-light capitalize'>{id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareContent;

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
