import { formatDateTimeForInput } from '@/lib/utils';
import {
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineXMark,
} from 'react-icons/hi2';
import {
  RiFacebookBoxLine,
  RiInstagramLine,
  RiTwitterXLine,
} from 'react-icons/ri';

export const BASEURL = 'https://www.mogz.studio';

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export const EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const PAGE_SIZE = 10;

export const ROUTES = [
  { name: 'Home', href: '/' },
  { name: 'Gallery', href: '/gallery' },
];

export const COLLECTION_SORT_OPTIONS = ['Newest', 'Oldest'];

export const MOGZ = {
  about:
    "Welcome to Mogz Visuals, where each click of our camera captures more than a moment—it tells your unique story. Our founder, Jacob Mogga Kei, leads our team with a vision for authentic expression and heartfelt connections, making every frame a canvas and every photograph a chapter in your life's narrative. With over a decade of experience, Jacob's philosophy of focusing on the genuine moments drives our commitment to visual storytelling. We are more than creators; we are custodians of your memories, dedicated to preserving the love, joy, laughter, and tears that make each photograph a testament to the human experience.",
  inspiration:
    'Our inspiration comes from the vivid tapestry of life that surrounds us—from the rich colors and diverse cultures of South Sudan to the personal stories of our clients. Each project is a new adventure, a new story to tell. We celebrate the beauty and uniqueness of each individual, community, and landscape we capture, always striving to convey the depth and emotion of the moment.',
  social: [
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=100066717096074',
      icon: <RiFacebookBoxLine />,
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/mogzvisuals/',
      icon: <RiInstagramLine />,
    },
    {
      label: 'Twitter',
      url: 'https://twitter.com/MogzVisuals',
      icon: <RiTwitterXLine />,
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
};

export const FORMS = {
  contact: {
    initialValue: {
      name: '',
      email: '',
      date: formatDateTimeForInput(new Date().toISOString()),
      session: 'indoor',
      message: '',
    },
    fields: [
      {
        id: 'contact-name',
        name: 'name',
        type: 'name',
        label: 'Your Name',
        placeholder: 'John Doe',
        required: true,
      },
      {
        id: 'contact-email',
        name: 'email',
        type: 'email',
        label: 'Your Email Address',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        id: 'contact-datetime',
        name: 'datetime',
        type: 'datetime-local',
        label: 'Session Date & Time',
        placeholder: 'Select a date',
        required: true,
      },
      {
        comp: 'radio',
        id: 'contact-session',
        name: 'session',
        label: 'Session Type',
        options: [
          { label: 'Indoor', value: 'indoor' },
          { label: 'Outdoor', value: 'outdoor' },
        ],
      },
      {
        comp: 'textarea',
        id: 'contact-message',
        name: 'message',
        label: 'Message',
        placeholder: 'Type your message here...',
      },
    ],
    rules: {
      name: (value: string) =>
        value.length > 2 ? '' : 'Name must be longer than 2 characters!',
      email: (value: string) => {
        return value.match(EMAIL_PATTERN)
          ? ''
          : 'Please enter a valid email address';
      },
      session: (value: string) => {
        const options = FORMS.contact.fields.find(
          (field) => field.name === 'session'
        )!.options!;
        if (options.find((option) => option.value === value)) {
          return '';
        }
        return 'Please select an option!';
      },
      datetime: (value: string) => {
        const selectedDateTime = new Date(value);
        const currentDateTime = new Date();

        if (isNaN(selectedDateTime.getTime())) {
          return 'Please select a valid date and time!';
        }

        if (selectedDateTime.getTime() < currentDateTime.getTime()) {
          return 'Date and time must be in the future!';
        }

        return '';
      },
      message: (value: string) =>
        value.length > 10 ? '' : 'Message must be longer than 10 characters!',
    },
  },
  browse: {
    fields: { id: '', password: '' },
    rules: {
      id: (value: string) => {
        if (value.length < 6) {
          return 'ID must be longer than 6 characters!';
        }
        if (/\s/.test(value)) {
          return 'ID must not contain spaces!';
        }
        return '';
      },
      password: (value: string) =>
        value.length >= 6 ? '' : 'Password must be longer than 6 characters!',
    },
  },
  search: {
    fields: { name: '' },
    rules: {
      name: (value: string) =>
        value.length > 2 ? '' : 'Name must be longer than 2 characters!',
    },
  },
  download: {
    fields: { email: '' },
    rules: {
      email: (value: string) => {
        return value.match(EMAIL_PATTERN)
          ? ''
          : 'Please enter a valid email address!';
      },
    },
  },
};

export const PAGE_HEADERS = [
  {
    title: 'Visual Stories, Captured Moments',
    paragraph:
      'Dive into our curated gallery of collections, where each card opens a window into a unique story captured through our lens. Every project reflects our dedication to visual excellence from weddings and corporate events to personal portraits and artistic endeavors. Click on any card to delve deeper into our creative world or enter a specific collection ID to access exclusive content.',
  },
  {
    title: 'Lost in the Frames?',
    paragraph:
      "It looks like the page you were searching for isn't in our gallery. Don't worry, we can help guide you back to the main exhibit. Click below to return to our homepage, or if you prefer a more personal touch, reach out to us directly for assistance.",
  },
  {
    title: 'Collection Not Found or Inaccessible',
    paragraph:
      "The collection you're trying to access is either not available or is private. If you believe this is an error, please try again. Access to private collections is limited to 1 hours, after which you will need to re-enter the collection ID and password. Click below to return to our homepage or browse our gallery for other captivating visual stories.",
  },
];

export const METADATA: Map<string, any> = new Map([
  [
    'home',
    {
      title:
        'Mogz Visuals - Premier Media and Production Studio in South Sudan',
      description:
        "The leading media and production studio in South Sudan, specializing in capturing life's moments through stunning visuals and creative storytelling.",
      type: 'website',
      url: `${BASEURL}`,
      image: `${BASEURL}/imgs/logo/logo.jpg`,
      icon: '/imgs/logo/favicon.ico',
    },
  ],
  [
    'gallery',
    {
      title: 'Gallery - Mogz Visuals Collections',
      description:
        'Explore the gallery of Mogz Visuals, showcasing our diverse collections of professional photography and videography that capture the essence of every moment.',
      type: 'website',
      url: `${BASEURL}/gallery`,
      image: `${BASEURL}/imgs/logo/logo.jpg`,
      icon: '/imgs/logo/favicon.ico',
    },
  ],
]);

export const EMPTY_STATE = {
  gallery: {
    heading: 'No Visual Stories Yet',
    paragraph:
      'Our gallery is currently empty, but new visual stories are on the way. Please check back soon to explore our captivating collections. In the meantime, feel free to contact us to discuss how we can bring your vision to life through our photography and videography services.',
  },
  filteredGallery: {
    heading: 'No Visual Stories Found',
    paragraph:
      "It looks like there are no collections matching your current filter criteria. Please try adjusting the filters to explore our captivating visual stories. If you still can't find what you're looking for, feel free to contact us to discuss how we can bring your vision to life through our photography and videography services.",
  },
  collection: {
    heading: 'Collection Under Construction',
    paragraph:
      'This collection is currently being curated and will soon feature stunning visuals. Please check back later to explore the complete collection. In the meantime, feel free to browse our other collections or contact us for more information.',
  },
};

export const TOAST_STATUS = {
  success: <HiOutlineCheckCircle className='text-green-500' />,
  error: <HiOutlineXMark className='text-red-600' />,
  info: <HiOutlineInformationCircle className='text-blue-500' />,
  warning: <HiOutlineExclamationCircle className='text-yellow-500' />,
};

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
