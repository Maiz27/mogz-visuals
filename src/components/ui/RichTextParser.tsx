import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity/client';
import { createSlug, extractYoutubeVideoId } from '@/lib/utils';
import { RichText } from '@/lib/types';

type props = {
  title: string;
  content: RichText;
};

export const RichTextParser = memo(({ title, content }: props) => {
  let imageIndex = 0;
  let videoIndex = 0;
  const myPortableTextComponents: PortableTextReactComponents = {
    types: {
      image: ({ value }) => {
        const imgUrl = urlFor(value).url();
        imageIndex++;
        return (
          <figure className='my-8 h-max w-full overflow-hidden rounded-xl md:w-11/12'>
            <Image
              width={1080}
              height={1080}
              src={imgUrl}
              loading='lazy'
              alt={`${title} - Image(${imageIndex})`}
              className='h-full w-full object-cover'
            />
          </figure>
        );
      },
      video: ({ value }) => {
        const { url } = value;
        const videoId = extractYoutubeVideoId(url);

        if (!videoId) {
          return null;
        }

        videoIndex++;

        return (
          <div className='my-8 aspect-video w-full overflow-hidden rounded-xl md:w-11/12'>
            <iframe
              allowFullScreen
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${title} - Video(${videoIndex})`}
              className='h-full w-full'
            />
          </div>
        );
      },
      callToAction: ({ value, isInline }) =>
        isInline ? (
          <a
            href={value.url}
            className='text-primary underline underline-offset-4'
          >
            {value.text}
          </a>
        ) : (
          <div className='callToAction'>{value.text}</div>
        ),
    },
    marks: {
      em: ({ children }) => <em className=''>{children}</em>,
      link: ({ children, value }) => {
        const target = value.href.startsWith('http') ? '_blank' : undefined;
        const rel = target === '_blank' ? 'noreferrer noopener' : undefined;

        return (
          <Link
            href={value.href}
            rel={rel}
            className='font-medium text-primary underline underline-offset-4'
          >
            {children}
          </Link>
        );
      },

      // Add any other custom marks you want to handle
    },
    block: {
      h2: ({ children }) => (
        <h2
          id={createSlug(children?.toString() || '')}
          className='scroll-heading my-6 scroll-m-16 px-2 text-3xl'
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          id={createSlug(children?.toString() || '')}
          className='scroll-heading my-4 scroll-m-16 px-2 text-2xl'
        >
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4
          id={createSlug(children?.toString() || '')}
          className='scroll-heading my-3 scroll-m-16 px-2 text-xl'
        >
          {children}
        </h4>
      ),
      h5: ({ children }) => (
        <h5
          id={createSlug(children?.toString() || '')}
          className='scroll-heading my-2 scroll-m-16 px-2 text-lg'
        >
          {children}
        </h5>
      ),
      h6: ({ children }) => (
        <h6
          id={createSlug(children?.toString() || '')}
          className='scroll-heading my-1 scroll-m-16 px-2 text-base'
        >
          {children}
        </h6>
      ),
      normal: ({ children }) => (
        <p className='mb-2 p-2 text-base'>{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className='mb-2 border-l-4 pl-2 text-base italic'>
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className='text-lg mb-4 list-disc space-y-2 pl-10 pr-2'>
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className='text-lg list-decimal space-y-2 pl-10 pr-2'>
          {children}
        </ol>
      ),
      // Add any other custom list types you want to handle
    },
    listItem: {
      bullet: ({ children }) => <li className=''>{children}</li>,
      number: ({ children }) => <li className=''>{children}</li>,
      // Add any other custom list item types you want to handle
    },
    hardBreak: () => <br />,
    unknownMark: () => null,
    unknownType: () => null,
    unknownBlockStyle: () => null,
    unknownList: () => null,
    unknownListItem: () => null,
  };

  return (
    <PortableText
      value={content}
      components={myPortableTextComponents}
      onMissingComponent={false}
    />
  );
});

RichTextParser.displayName = 'Rich Text Parser';
