import {
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from 'react-icons/hi2';

export const PAGE_SECTIONS = [
  { name: 'About', id: 'about' },
  { name: 'Services', id: 'services' },
  { name: 'Contact', id: 'contact' },
];

export const HERO_IMAGES = [
  '/imgs/hero/1.jpg',
  '/imgs/hero/2.jpg',
  '/imgs/hero/3.jpg',
  '/imgs/hero/4.jpg',
  '/imgs/hero/5.jpg',
  '/imgs/hero/6.jpg',
  '/imgs/hero/7.jpg',
  '/imgs/hero/8.jpg',
  '/imgs/hero/9.jpg',
  '/imgs/hero/10.jpg',
  '/imgs/hero/11.jpg',
  '/imgs/hero/12.jpg',
  '/imgs/hero/13.jpg',
  '/imgs/hero/14.jpg',
  '/imgs/hero/15.jpg',
  '/imgs/hero/16.jpg',
  '/imgs/hero/17.jpg',
  '/imgs/hero/18.jpg',
  '/imgs/hero/19.jpg',
  '/imgs/hero/20.jpg',
];

export const MOGZ = {
  about:
    "Welcome to Mogz Visual, where each click of our camera captures more than a moment—it tells your unique story. Our founder, Jacob Mogga Kei, leads our team with a vision for authentic expression and heartfelt connections, making every frame a canvas and every photograph a chapter in your life's narrative. With over a decade of experience, Jacob's philosophy of focusing on the genuine moments drives our commitment to visual storytelling. We are more than creators; we are custodians of your memories, dedicated to preserving the love, joy, laughter, and tears that make each photograph a testament to the human experience.",
  inspiration:
    'Our inspiration comes from the vivid tapestry of life that surrounds us—from the rich colors and diverse cultures of South Sudan to the personal stories of our clients. Each project is a new adventure, a new story to tell. We celebrate the beauty and uniqueness of each individual, community, and landscape we capture, always striving to convey the depth and emotion of the moment.',
  social: [
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=100066717096074',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/mogzvisuals/',
    },
    {
      label: 'Twitter',
      url: 'https://twitter.com/MogzVisuals',
    },
  ],
  contact: [
    {
      title: 'Visit',
      icon: HiOutlineMapPin,
      href: undefined,
      text: 'Phenicia Juba, CES, South Sudan.',
    },
    {
      title: 'Email',
      icon: HiOutlineEnvelope,
      href: 'mailto:contact@mogz.studio',
      text: 'contact@mogz.studio',
    },
    {
      title: 'Call',
      icon: HiOutlinePhone,
      href: 'tel:+211924436655',
      text: '+211-924-436-655',
    },
    // {
    //   title: 'Call',
    //   icon: HiOutlinePhone ,
    //   href: 'tel:+211922222385',
    //   text: '+211-922-222-385',
    // },
  ],
  services: [
    {
      title: 'Wedding Photography',
      images: [
        '/imgs/hero/1.jpg',
        '/imgs/hero/2.jpg',
        '/imgs/hero/3.jpg',
        '/imgs/hero/4.jpg',
        '/imgs/hero/5.jpg',
      ],
    },
    {
      title: 'Commercial Visuals',
      images: [
        '/imgs/hero/6.jpg',
        '/imgs/hero/7.jpg',
        '/imgs/hero/8.jpg',
        '/imgs/hero/9.jpg',
        '/imgs/hero/10.jpg',
      ],
    },
    {
      title: 'Portrait Sessions',
      images: [
        '/imgs/hero/11.jpg',
        '/imgs/hero/12.jpg',
        '/imgs/hero/13.jpg',
        '/imgs/hero/14.jpg',
        '/imgs/hero/15.jpg',
      ],
    },
    {
      title: 'Aerial Perspectives',
      images: [
        '/imgs/hero/16.jpg',
        '/imgs/hero/17.jpg',
        '/imgs/hero/18.jpg',
        '/imgs/hero/19.jpg',
        '/imgs/hero/20.jpg',
      ],
    },
    {
      title: 'Architectural Imagery',
      images: [
        '/imgs/hero/1.jpg',
        '/imgs/hero/2.jpg',
        '/imgs/hero/3.jpg',
        '/imgs/hero/4.jpg',
        '/imgs/hero/5.jpg',
      ],
    },
    {
      title: 'Product Imagery',
      images: [
        '/imgs/hero/6.jpg',
        '/imgs/hero/7.jpg',
        '/imgs/hero/8.jpg',
        '/imgs/hero/9.jpg',
        '/imgs/hero/10.jpg',
      ],
    },
    {
      title: 'Social Media Content',
      images: [
        '/imgs/hero/11.jpg',
        '/imgs/hero/12.jpg',
        '/imgs/hero/13.jpg',
        '/imgs/hero/14.jpg',
        '/imgs/hero/15.jpg',
      ],
    },
  ],
};

export const CONTACT_FIELDS = [
  {
    name: 'name',
    type: 'name',
    placeholder: 'Your Full Name',
    required: true,
  },
  {
    name: 'email',
    type: 'email',
    placeholder: 'Your Email Address',
    required: true,
  },
  {
    name: 'message',
    type: 'textarea',
    placeholder: 'Write your message here...',
    required: true,
  },
];

export const IMAGE_CARD_ANIMATE_OPTIONS = {
  slideLeft: {
    origin: '0% 50%',
    animate: 'scaleX',
  },
  slideRight: {
    origin: '100% 50%',
    animate: 'scaleX',
  },
  slideUp: {
    origin: '50% 0%',
    animate: 'scaleY',
  },
  slideDown: {
    origin: '150% 100%',
    animate: 'scaleY',
  },
};
