'use client';

import Link from 'next/link';
import ImageCard from '../imageCard/ImageCard';
import useWindowWidth from '@/lib/hooks/useWindowWidth';
import { SOCIAL_ICONS } from '@/lib/Constants';
import { TEAM_MEMBER } from '@/lib/types';

type Props = {
  member: TEAM_MEMBER;
  index: number;
};

const TeamMember = ({ member, index }: Props) => {
  const { name, title, image, socials } = member;
  const width = useWindowWidth();

  return (
    <div
      data-scroll
      data-scroll-speed={width < 768 ? 1 : index % 2 ? 1 : 2}
      data-scroll-target='#about'
      className='flex flex-col items-center gap-8 relative mb-20'
    >
      <ImageCard
        src={image}
        alt={name}
        title={`[MOGZ]-${name}`}
        animate='scaleY'
        repetitionCount={5}
      />
      <div className='flex flex-col items-center absolute -bottom-16 z-20'>
        <span className='text-copy font-bold font-heading text-xl'>
          {title}
        </span>
        <span className='text-primary text-lg'>{name}</span>
        {socials && socials.length > 0 && (
          <div className='flex gap-4 mt-2'>
            {socials.map((social, i) => {
              const SocialIcon =
                SOCIAL_ICONS[social.provider as keyof typeof SOCIAL_ICONS];
              if (!SocialIcon) return null;
              return (
                <Link
                  key={i}
                  href={social.url.href}
                  target='_blank'
                  className='text-xl hover:text-primary transition-colors'
                >
                  <SocialIcon />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
