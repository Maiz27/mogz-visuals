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

import CollectionDrawerHeader from '../gallery/CollectionDrawerHeader';
import { SOCIAL_ICONS } from '@/lib/Constants';

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
    <div className='flex flex-col gap-4'>
      <CollectionDrawerHeader collection={collection} />

      <label className='form-control w-full'>
        <div className='label'>
          <span className='label-text'>Page URL</span>
        </div>
        <div className='flex items-center gap-2'>
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
        {socials.map(({ id, icon, ShareButton }) => {
          const Icon = icon;
          return (
            <div key={id} className='flex flex-col items-center gap-2'>
              <ShareButton
                url={currentURL}
                className='transition-transform active:scale-95 hover:scale-110'
              >
                <div className='text-4xl hover:text-primary transition-colors'>
                  <Icon />
                </div>
              </ShareButton>
              <span className='text-xs  capitalize'>{id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShareContent;

const socials = [
  {
    id: 'email',
    icon: SOCIAL_ICONS.email,
    ShareButton: EmailShareButton,
  },
  {
    id: 'facebook',
    icon: SOCIAL_ICONS.facebook,
    ShareButton: FacebookShareButton,
  },
  {
    id: 'linkedin',
    icon: SOCIAL_ICONS.linkedin,
    ShareButton: LinkedinShareButton,
  },
  {
    id: 'telegram',
    icon: SOCIAL_ICONS.telegram,
    ShareButton: TelegramShareButton,
  },
  {
    id: 'twitter',
    icon: SOCIAL_ICONS.x,
    ShareButton: TwitterShareButton,
  },
  {
    id: 'whatsapp',
    icon: SOCIAL_ICONS.whatsapp,
    ShareButton: WhatsappShareButton,
  },
];
