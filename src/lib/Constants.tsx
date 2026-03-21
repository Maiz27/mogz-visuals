import Link from 'next/link';

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
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiTelegram,
  SiTiktok,
  SiWhatsapp,
  SiX,
} from 'react-icons/si';

export const SITE_NAME = 'Mogz Visuals';

export const BASEURL = 'https://www.mogz.studio';

export const EMAIL_PATTERN = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const PAGE_SIZE = 10;

export const ROUTES = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
];

export const BOOK_ROUTE = { name: 'Book Now', href: '/book' };

export const LEGAL_ROUTES = [
  { name: 'Terms of Use', href: '/terms-of-use' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

export const COLLECTION_SORT_OPTIONS = ['Newest', 'Oldest'];

export const SOCIALS = [
  {
    label: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=100066717096074',
    icon: <SiFacebook />,
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/mogzvisuals/',
    icon: <SiInstagram />,
  },
  {
    label: 'Twitter',
    url: 'https://twitter.com/MogzVisuals',
    icon: <SiX />,
  },
];

export const MOGZ = {
  about:
    "Welcome to Mogz Visuals, where each click of our camera captures more than a moment—it tells your unique story. Our founder, Jacob Mogga Kei, leads our team with a vision for authentic expression and heartfelt connections, making every frame a canvas and every photograph a chapter in your life's narrative. With over a decade of experience, Jacob's philosophy of focusing on the genuine moments drives our commitment to visual storytelling. We are more than creators; we are custodians of your memories, dedicated to preserving the love, joy, laughter, and tears that make each photograph a testament to the human experience.",
  inspiration:
    'Our inspiration comes from the vivid tapestry of life that surrounds us—from the rich colors and diverse cultures of South Sudan to the personal stories of our clients. Each project is a new adventure, a new story to tell. We celebrate the beauty and uniqueness of each individual, community, and landscape we capture, always striving to convey the depth and emotion of the moment.',

  contact: [
    {
      title: 'Visit',
      icon: HiOutlineMapPin,
      href: undefined,
      text: 'Thongping Next to Phenicia Supermarket, Juba, South Sudan',
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
      message: '',
      terms: false,
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
        comp: 'textarea',
        id: 'contact-message',
        name: 'message',
        label: 'Message',
        placeholder: 'Type your message here...',
      },
      {
        comp: 'checkbox',
        id: 'contact-terms',
        name: 'terms',
        label: (
          <span>
            I agree to the{' '}
            <Link
              href='/terms-of-use'
              target='_blank'
              className='underline hover:text-primary transition-colors'
            >
              Terms & Conditions
            </Link>
          </span>
        ),
        required: true,
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
      message: (value: string) =>
        value.length > 10 ? '' : 'Message must be longer than 10 characters!',
      terms: (value: boolean) => (value ? '' : 'You must agree to the terms!'),
    },
  },
  browse: {
    initialValue: { id: '', password: '' },
    fields: [
      {
        id: 'browse-id',
        name: 'id',
        type: 'text',
        label: 'Collection ID',
        placeholder: 'collection-000',
        required: true,
      },
      {
        id: 'browse-password',
        name: 'password',
        type: 'password',
        label: 'Collection Password',
        placeholder: '####',
        required: true,
      },
    ],
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
    initialValue: { name: '' },
    fields: [
      {
        id: 'search-name',
        name: 'name',
        type: 'text',
        label: 'Collection Name',
        placeholder: 'Party XYZ',
        required: true,
      },
    ],
    rules: {
      name: (value: string) =>
        value.length > 2 ? '' : 'Name must be longer than 2 characters!',
    },
  },
  download: {
    initialValue: { email: '', part: '0' },
    fields: [
      {
        id: 'download-email',
        name: 'email',
        type: 'email',
        label: 'Your Email Address',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        comp: 'radio',
        id: 'download-part',
        name: 'part',
        label: 'Select part of the collection to download (100 images / part)',
        options: [],
      },
    ],
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
    'about',
    {
      title: 'About Us - Mogz Visuals',
      description:
        'Meet the creative team behind Mogz Visuals. We are storytellers dedicated to capturing your most precious moments.',
      type: 'website',
      url: `${BASEURL}/about`,
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
  [
    'terms',
    {
      title: 'Terms of Use - Mogz Visuals',
      description:
        'Read our Terms of Use to understand the guidelines, rights, and responsibilities that govern your use of Mogz Visuals services and website.',
      type: 'website',
      url: `${BASEURL}/terms-of-use`,
      image: `${BASEURL}/imgs/logo/logo.jpg`,
      icon: '/imgs/logo/favicon.ico',
    },
  ],
  [
    'privacy',
    {
      title: 'Privacy Policy - Mogz Visuals',
      description:
        'Learn how Mogz Visuals collects, uses, and protects your personal information. Your privacy and trust are our top priorities.',
      type: 'website',
      url: `${BASEURL}/privacy-policy`,
      image: `${BASEURL}/imgs/logo/logo.jpg`,
      icon: '/imgs/logo/favicon.ico',
    },
  ],
  [
    'book',
    {
      title: 'Book a Session - Mogz Visuals',
      description:
        'Book your photography or videography session with Mogz Visuals. Choose from studio portraits, weddings, events, corporate coverage, and more.',
      type: 'website',
      url: `${BASEURL}/book`,
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
  team: {
    heading: 'Meet the Team Soon',
    paragraph:
      'We are currently assembling our team page. Please check back later to meet the creative minds behind Mogz Visuals. Our dedicated photographers and videographers are working hard to bring you their stories.',
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

export const PAGES = {
  about: {
    title: 'The Minds Behind the Magic',
    paragraph:
      'Meet the creative collective at Mogz Visuals. We are more than just photographers and videographers; we are storytellers dedicated to preserving your most cherished memories with passion and artistic vision.',
  },
  gallery: {
    title: 'Visual Stories, Captured Moments',
    paragraph:
      'Dive into our curated gallery of collections, where each card opens a window into a unique story captured through our lens. Every project reflects our dedication to visual excellence from weddings and corporate events to personal portraits and artistic endeavors. Click on any card to delve deeper into our creative world or enter a specific collection ID to access exclusive content.',
  },
  privacy: {
    title: 'Your Privacy, Secure & Respected',
    description:
      'Your privacy is important to us. We are committed to protecting the personal information you share with us. This policy explains how we collect, use, and safeguard your data when you visit our website or use our services.',
  },
  terms: {
    title: 'Our Commitments, Your Rights',
    description:
      'Please read these terms carefully before using our website or services. By accessing or using Mogz Visuals, you agree to be bound by these terms, which govern our relationship and ensure a clear understanding of our mutual rights and responsibilities.',
  },
};

export const SOCIAL_ICONS = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  x: SiX,
  linkedin: SiLinkedin,
  tiktok: SiTiktok,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  email: HiOutlineEnvelope,
};

import type { BookingCategory } from '@/lib/types';

export const BOOKING_DATA: BookingCategory[] = [
  {
    id: 'studio-photography',
    name: 'Studio Photography',
    shortName: 'Studio',
    description: 'Professional indoor sessions with controlled lighting and elegant backdrops.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    packages: [
      {
        id: 'studio-mini',
        name: 'Mini Session',
        price: 50,
        duration: '30 minutes',
        description: 'Perfect for a quick, polished single-look portrait.',
        includes: ['1 outfit', '30-minute session', '7 high-resolution edited images', 'Online delivery within 3 days'],
      },
      {
        id: 'studio-standard',
        name: 'Standard Session',
        price: 100,
        duration: '1 hour',
        description: 'Versatile session with multiple looks.',
        includes: ['1-hour session', '2 to 3 outfits', '15 edited images', 'Online delivery'],
      },
      {
        id: 'studio-family',
        name: 'Family or Group Session',
        price: 150,
        duration: '1 hour',
        description: 'Capture the whole crew — posed and candid.',
        includes: ['1-hour session', 'Up to 5 people (Add $10 per extra person)', '15 edited group/family photos', 'Posed & candid options', 'Online gallery + softcopy'],
      },
      {
        id: 'studio-premium',
        name: 'Premium Session',
        price: 250,
        duration: '1.5 hours',
        description: 'Full experience with light makeup and print-ready deliverables.',
        includes: ['1.5-hour session + simple makeup', 'Up to 3 outfits', '20 edited images', 'Print-ready & social media versions', 'Complimentary A4 photo print'],
      },
    ],
    addOns: [
      { id: 'studio-extra-edit', name: 'Extra Edited Photo', price: 10 },
      { id: 'studio-makeup', name: 'Professional Makeup', price: 25 },
      { id: 'studio-rush', name: 'Rush Delivery (24 hrs)', price: 20 },
      { id: 'studio-print', name: 'Photo Prints', price: 5, description: 'From $5 per print' },
    ],
  },
  {
    id: 'outdoor-photography',
    name: 'Outdoor Photography',
    shortName: 'Outdoor',
    description: 'Natural light sessions at beautiful locations — from golden hour to urban backdrops.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    packages: [
      {
        id: 'outdoor-mini-love',
        name: 'Mini Love Session',
        price: 150,
        duration: '1 hour',
        description: 'Perfect for casual couples\'  moments or anniversaries.',
        includes: ['1-hour outdoor session', '1 outfit', '15 professionally edited images', 'One outdoor location', 'Online gallery within 4 days'],
      },
      {
        id: 'outdoor-regular',
        name: 'Regular Outdoor Shoot',
        price: 150,
        duration: '1 hour',
        description: 'Relaxed outdoor session at a location of your choice.',
        includes: ['1-hour outdoor session', '1 outfit', '25 professionally edited images', 'One outdoor location', 'Online gallery within 4 days'],
      },
      {
        id: 'outdoor-romantic',
        name: 'Romantic Getaway',
        price: 200,
        duration: '2 hours',
        description: 'Two-hour session with light direction and posing included.',
        includes: ['2-hour session', 'Up to 2 outfits', '20 edited images', 'Location of your choice (within town)', 'Light direction & posing included', 'Online delivery'],
      },
      {
        id: 'outdoor-golden',
        name: 'Golden Hour Experience',
        price: 250,
        duration: '2.5 hours',
        description: 'Sunrise or sunset magic — the most cinematic light of the day.',
        includes: ['2.5-hour session at golden hour', 'Up to 3 outfit changes', '30+ edited high-resolution images', 'Two locations (if time allows)', 'Black & white edits included', 'Complimentary short clip'],
      },
    ],
  },
  {
    id: 'pre-wedding',
    name: 'Pre-Wedding & Engagement',
    shortName: 'Engagement',
    description: 'Styled sessions to celebrate your love story before the big day.',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
    packages: [
      {
        id: 'pre-wedding-deluxe',
        name: 'Engagement Deluxe',
        price: 350,
        duration: '3 hours',
        description: 'Full styled outdoor session with cinematic teaser clip.',
        includes: ['3-hour styled outdoor session', '3 outfit changes', '40+ fully edited images', 'Custom mood & posing guide', 'Short cinematic teaser clip', 'High quality & social media image formats'],
      },
    ],
    addOns: [
      { id: 'pre-extra-img', name: 'Extra Edited Image', price: 5 },
      { id: 'pre-bts', name: 'Behind-the-Scenes Video', price: 50 },
      { id: 'pre-makeup', name: 'Professional Makeup & Hair', price: 100, description: 'From $100' },
      { id: 'pre-frame', name: 'Framed Print or Album', price: 25, description: 'From $25' },
    ],
  },
  {
    id: 'wedding-photography',
    name: 'Wedding Photography',
    shortName: 'Wedding Photo',
    description: 'Full-day wedding coverage capturing every cherished moment from ceremony to reception.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    packages: [
      {
        id: 'wedding-photo-bronze',
        name: 'Bronze Package',
        price: 500,
        duration: 'Start of program – midnight',
        includes: ['Pre-church photos', 'Church photos', 'Outdoor photoshoot', 'Reception', 'Photos on a flash drive'],
      },
      {
        id: 'wedding-photo-silver',
        name: 'Silver Package',
        price: 700,
        duration: 'Start of program – midnight',
        includes: ['Pre-church photos', 'Church photos', 'Outdoor photoshoot', 'Reception', 'Photos on a flash drive', 'Two A2 frames'],
      },
      {
        id: 'wedding-photo-gold',
        name: 'Gold Package',
        price: 1000,
        duration: 'Start of program – midnight',
        includes: ['Pre-church photos', 'Church photos', 'Outdoor photoshoot', 'Reception', 'Photos on a flash drive', 'A3 photobook', 'Wedding highlight video', 'Two A2 frames'],
      },
    ],
  },
  {
    id: 'wedding-videography',
    name: 'Wedding Videography',
    shortName: 'Wedding Video',
    description: 'Cinematic wedding films — from highlight reels to full feature-length productions.',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    packages: [
      {
        id: 'wedding-video-basic',
        name: 'Basic Package',
        price: 500,
        duration: '4–5 minute highlight reel',
        includes: ['1 camera operator', 'Ceremony & reception coverage', 'Basic editing (music overlay, color correction)', 'Online delivery'],
      },
      {
        id: 'wedding-video-standard',
        name: 'Standard Package',
        price: 1000,
        duration: '8–10 minute highlight + full ceremony',
        includes: ['2 camera operators', 'Full coverage (ceremony, speeches, reception)', 'Aerial drone shots (weather permitting)', 'Audio capture for clear speeches', 'Music, editing & color correction', 'USB drive or online link'],
      },
      {
        id: 'wedding-video-premium',
        name: 'Premium Package',
        price: 1500,
        duration: '15–20 minute cinematic film + highlight video',
        includes: ['2–3 camera operators', 'Full-day coverage (up to 10 hours)', 'Drone footage', 'Audio capture + vow mic', 'Full editing (color grading, music, voiceovers)', 'Custom intro/outro animations', 'USB drive + online gallery'],
      },
      {
        id: 'wedding-video-deluxe',
        name: 'Deluxe Package',
        price: 3000,
        duration: '30–60 minute feature film + 4–6 min highlight',
        includes: ['3 camera operators + drone', 'Full-day coverage (up to 12 hours)', 'Interviews with couple & family', 'Voiceover, music licensing, advanced editing', 'Custom wedding video album', 'USB drive + online gallery'],
      },
    ],
    addOns: [
      { id: 'wedding-video-drone', name: 'Drone Footage', price: 500 },
      { id: 'wedding-video-love-story', name: 'Love Story Video (pre-wedding)', price: 1200 },
      { id: 'wedding-video-extra-hr', name: 'Additional Hour of Coverage', price: 250 },
      { id: 'wedding-video-livestream', name: 'Live Stream Wedding', price: 600 },
    ],
  },
  {
    id: 'event-photography',
    name: 'Event Photography',
    shortName: 'Events',
    description: 'Professional coverage for birthdays, parties, launches, and every celebration in between.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    packages: [
      {
        id: 'event-basic',
        name: 'Basic Package',
        price: 150,
        duration: 'Up to 2 hours',
        includes: ['One photographer', '50+ edited digital images', 'Online delivery within 3 days'],
      },
      {
        id: 'event-standard',
        name: 'Standard Package',
        price: 250,
        duration: 'Up to 4 hours',
        includes: ['One photographer', '100+ edited images', 'Event highlights photo gallery', 'Optional: Flash drive delivery'],
      },
      {
        id: 'event-premium',
        name: 'Premium Package',
        price: 400,
        duration: 'Full day (up to 8 hours)',
        includes: ['Two photographers', '200+ professionally edited photos', 'Social media highlights within 24 hours', 'USB + Online Gallery', 'Complimentary A4 event print'],
      },
    ],
    addOns: [
      { id: 'event-extra-hr', name: 'Extra Hour', price: 50 },
      { id: 'event-prints', name: 'Photo Prints', price: 5, description: 'From $5/print' },
      { id: 'event-photobook', name: 'Custom Photobook', price: 40, description: 'From $40' },
      { id: 'event-slideshow', name: 'Slideshow Video (with music)', price: 25 },
      { id: 'event-same-day', name: 'Same-Day Edits for Display', price: 30 },
    ],
  },
  {
    id: 'corporate',
    name: 'Conference & Corporate',
    shortName: 'Corporate',
    description: 'High-quality coverage for conferences, workshops, launches, and corporate events.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    packages: [
      {
        id: 'corporate-half',
        name: 'Half-Day Coverage',
        price: 200,
        duration: 'Up to 4 hours',
        includes: ['One professional photographer', '80+ high-quality edited images', 'Online delivery within 48 hours', 'Suitable for workshops, launches, morning sessions'],
      },
      {
        id: 'corporate-full',
        name: 'Full-Day Coverage',
        price: 350,
        duration: 'Up to 8 hours',
        includes: ['1 or 2 photographers', '150+ edited photos', 'Wide shots, keynotes, guest interactions, branding', 'Online gallery', '3–5 same-day images for media/press'],
      },
      {
        id: 'corporate-executive',
        name: 'Executive Package',
        price: 500,
        duration: 'Up to 10 hours',
        includes: ['Two photographers + assistant', '200+ premium edited images', 'Branding, speaker portraits, crowd shots', 'Social media highlights within 12–24 hours', 'Custom slideshow for post-event promotion'],
      },
    ],
    addOns: [
      { id: 'corp-photo-station', name: 'On-site Instant Photo Station', price: 100, description: 'From $100' },
      { id: 'corp-rush', name: 'Rush Full Delivery (24 hours)', price: 40 },
      { id: 'corp-extra-hr', name: 'Additional Hours', price: 50, description: '$50/hr' },
      { id: 'corp-headshots', name: 'Staff ID Headshots', price: 5, description: 'From $5/person' },
      { id: 'corp-video', name: 'Event Video Highlights', price: 250, description: 'From $250' },
    ],
  },
  {
    id: 'real-estate-photo',
    name: 'Real Estate Photography',
    shortName: 'Real Estate',
    description: 'Property photography that sells — residential homes to commercial complexes.',
    image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    packages: [
      {
        id: 're-photo-basic',
        name: 'Residential – Basic',
        price: 100,
        description: 'Ideal for small apartments or single-room homes.',
        includes: ['15–20 edited photos', 'Online delivery'],
      },
      {
        id: 're-photo-standard',
        name: 'Residential – Standard',
        price: 150,
        description: 'For 2–3 bedroom homes.',
        includes: ['25–35 edited photos', 'Online delivery'],
      },
      {
        id: 're-photo-premium',
        name: 'Residential – Premium',
        price: 200,
        description: 'For 3–5 bedroom homes.',
        includes: ['40+ edited photos', 'Online delivery'],
      },
      {
        id: 're-photo-mini-commercial',
        name: 'Mini Commercial',
        price: 150,
        description: 'Small office or retail unit.',
        includes: ['Up to 25 edited photos', 'Online delivery'],
      },
      {
        id: 're-photo-standard-commercial',
        name: 'Standard Commercial',
        price: 250,
        description: 'For online listings.',
        includes: ['35–50 photos', 'Wide angles for online listings'],
      },
      {
        id: 're-photo-full-commercial',
        name: 'Full Commercial',
        price: 400,
        includes: ['60+ images', 'Drone photography', 'Custom editing'],
      },
    ],
    addOns: [
      { id: 're-photo-tour', name: 'Video Tour (1–2 min)', price: 200 },
      { id: 're-photo-same-day', name: 'Same-Day Delivery', price: 50 },
    ],
  },
  {
    id: 'documentary-photo',
    name: 'Documentary Photography',
    shortName: 'Documentary',
    description: 'Authentic visual storytelling for NGOs, missions, campaigns, and multi-day projects.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    packages: [
      {
        id: 'doc-photo-half',
        name: 'Half-Day Field Coverage',
        price: 250,
        duration: 'Up to 4 hours',
        description: 'Short field visits, interviews, or specific program coverage.',
        includes: ['50+ professionally edited images', 'Storytelling focus', 'Online gallery + secure download link'],
      },
      {
        id: 'doc-photo-full',
        name: 'Full-Day Field Coverage',
        price: 400,
        duration: 'Up to 8 hours',
        description: 'Ideal for NGOs, missions, campaigns, or full-day activities.',
        includes: ['100–150 edited images', 'Environment, human interaction, cultural & emotional capture', 'Same-day selection of 5–10 key images (optional)'],
      },
      {
        id: 'doc-photo-multi',
        name: 'Multi-Day Project',
        price: 1000,
        duration: '2–5 days',
        description: 'Deep-dive coverage for institutional or large-scale projects.',
        includes: ['200–400 edited images', 'Pre-shoot planning consultation', 'Archiving, tagging & file organization', 'Interviews, portraits, candid, landscapes'],
      },
    ],
  },
  {
    id: 'social-media-reels',
    name: 'Social Media Reels',
    shortName: 'Reels',
    description: 'Scroll-stopping vertical content for Instagram, TikTok, and Facebook.',
    image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80',
    packages: [
      {
        id: 'reel-basic',
        name: 'Basic Package',
        price: 150,
        duration: 'Up to 30 seconds',
        description: 'Best for personal use, quick promos & social updates.',
        includes: ['1-hour shoot (single location)', 'Basic editing (cuts, captions, transitions)', 'Background music (non-licensed)', '1x Final Reel (HD quality)', 'Delivery: 3–4 days'],
      },
      {
        id: 'reel-standard',
        name: 'Standard Package',
        price: 250,
        duration: 'Up to 60 seconds',
        description: 'Best for small businesses, influencers & product promos.',
        includes: ['Creative concept + simple script', 'Professional filming (camera, lighting, audio)', 'Editing with text transitions, captions', 'Licensed music + audio mix', 'Professional color grading', '1x Final Reel (HD/4K)', '2 revisions included', 'Delivery: 5 working days'],
      },
      {
        id: 'reel-premium',
        name: 'Premium Package',
        price: 500,
        duration: 'Up to 90 seconds',
        description: 'Best for brands, campaigns & high-end marketing reels.',
        includes: ['Full creative direction + detailed script', 'Multiple shooting locations (up to 3)', 'Professional filming crew with advanced gear', 'Advanced editing + branded motion graphics', 'Licensed music & sound design', 'Cinematic color grading', 'Up to 3 reel variations (IG/TikTok/FB)', '3 revisions included', 'Delivery: 7–10 working days'],
      },
    ],
    addOns: [
      { id: 'reel-extra-version', name: 'Extra Reel Version (diff platform cut)', price: 75 },
      { id: 'reel-extra-revision', name: 'Extra Revision Round', price: 25 },
      { id: 'reel-rush', name: 'Rush Delivery (48 hrs)', price: 0, description: '+20% of total' },
    ],
  },
  {
    id: 'tvc-production',
    name: 'TVC Production',
    shortName: 'TVC',
    description: 'Full-scale television commercial production from script to screen.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
    packages: [
      {
        id: 'tvc-basic',
        name: 'Basic TVC',
        price: 2500,
        duration: '15–30 seconds',
        includes: ['Scriptwriting & storyboarding', 'Single-camera shoot', 'Basic location setup', '1–2 talent/actors', 'Basic editing + color correction', '1 revision', 'HD delivery'],
      },
      {
        id: 'tvc-standard',
        name: 'Standard TVC',
        price: 8000,
        duration: '15–30 seconds',
        includes: ['Scriptwriting, storyboarding & creative direction', '2–3 camera operators', 'Full-day shoot (up to 8 hours)', 'Up to 3 talent/actors', 'Professional makeup, lighting & sound', 'Music licensing & sound design', 'Advanced editing (color grading, VFX)', '2 revisions', 'HD/4K delivery'],
      },
      {
        id: 'tvc-premium',
        name: 'Premium TVC',
        price: 20000,
        duration: '60–90 seconds',
        includes: ['Full pre-production (scriptwriting through mood boards)', '3–4 camera operators (incl. Steadicam and/or drone)', 'Extensive location scouting & permits', 'Multi-location full-day shoot (up to 12 hours)', '4–5 talent/actors, stylists & makeup artists', 'Cinematic lighting, sound & set design', 'Voiceover artist (if needed)', 'Music licensing & custom soundtrack', 'Comprehensive post-production (color, VFX, sound)', '3 revisions', 'HD/4K delivery + social media edit'],
      },
    ],
    addOns: [
      { id: 'tvc-drone', name: 'Drone Footage', price: 1500 },
      { id: 'tvc-voiceover', name: 'Voiceover', price: 300 },
      { id: 'tvc-talent', name: 'Talent Fees (per actor)', price: 500, description: '$500–$1,000' },
      { id: 'tvc-casting', name: 'Casting Call & Talent Search', price: 2500 },
      { id: 'tvc-music', name: 'Custom Music Composition', price: 2000 },
      { id: 'tvc-extra-day', name: 'Extra Shooting Day', price: 3500 },
      { id: 'tvc-social-cut', name: 'Social Media Cuts (15–30s)', price: 1000 },
      { id: 'tvc-bts', name: 'Behind-the-Scenes Video', price: 2000 },
    ],
  },
  {
    id: 'editing-only',
    name: 'Editing Only',
    shortName: 'Editing',
    description: 'Send us your raw footage — we\'ll craft it into something extraordinary.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    packages: [
      {
        id: 'edit-basic',
        name: 'Basic Edit',
        price: 75,
        duration: 'Up to 30 seconds',
        description: 'Simple cut, captions, transitions, background music.',
        includes: ['Simple cut', 'Captions', 'Transitions', 'Background music'],
      },
      {
        id: 'edit-standard',
        name: 'Standard Edit',
        price: 200,
        duration: 'Up to 60 seconds',
        description: 'Polished edit with text animations and licensed music.',
        includes: ['Polished edit', 'Text animations', 'Color correction', 'Licensed music'],
      },
      {
        id: 'edit-premium',
        name: 'Premium Edit',
        price: 350,
        duration: 'Up to 90 seconds',
        description: 'Full creative direction with motion graphics.',
        includes: ['Full creative direction', 'Motion graphics', 'Advanced color grading', 'Multiple versions (IG, TikTok, FB)'],
      },
    ],
  },
  {
    id: 'branding',
    name: 'Branding Photography',
    shortName: 'Branding',
    description: 'Visual identity shoots for entrepreneurs, brands, and growing businesses.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    packages: [
      {
        id: 'brand-basic',
        name: 'Basic Package',
        price: 400,
        duration: 'Half-day (up to 4 hours)',
        includes: ['1 location', 'Simple styled setup', '10 final images', 'Delivery in 5 days'],
      },
      {
        id: 'brand-standard',
        name: 'Standard Package',
        price: 900,
        duration: 'Full-day (5–8 hours)',
        includes: ['2–3 locations', 'Styled setup with props/models', '20 final images', 'Delivery in 7 days'],
      },
      {
        id: 'brand-premium',
        name: 'Premium Package',
        price: 2000,
        duration: 'Multi-day (2+ days)',
        includes: ['3+ locations', 'Advanced styling', 'Multiple setups', '40 final images', 'Delivery in 10–14 days'],
      },
    ],
    addOns: [
      { id: 'brand-extra-img', name: 'Extra Images', price: 37, description: '$25–$50 per image' },
      { id: 'brand-retouch', name: 'Heavy Retouching / Advanced Editing', price: 75, description: '$50–$100 per image' },
      { id: 'brand-rush', name: 'Rush Delivery (48 hrs)', price: 0, description: '+20% of total' },
    ],
  },
  {
    id: 'product-photography',
    name: 'Product Photography',
    shortName: 'Products',
    description: 'Clean, compelling product imagery for e-commerce, menus, and marketing.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    packages: [
      {
        id: 'product-basic',
        name: 'Basic Package',
        price: 150,
        description: 'Studio shoot, plain background, basic editing.',
        includes: ['Up to 10 products', 'Studio shoot', 'Plain background', 'Basic editing', 'Delivery: 3–5 days'],
      },
      {
        id: 'product-standard',
        name: 'Standard Package',
        price: 300,
        description: 'Studio shoot with advanced lighting and standard retouching.',
        includes: ['Up to 20 products', 'White/colored background', 'Advanced lighting', 'Standard retouching', 'Delivery: 5–7 days'],
      },
      {
        id: 'product-premium',
        name: 'Premium Package',
        price: 600,
        description: 'Creative setup with lifestyle props and advanced retouching.',
        includes: ['Up to 30 products', 'Creative setup', 'Multiple angles', 'Lifestyle props', 'Advanced retouching', 'Delivery: 7–10 days'],
      },
    ],
  },
  {
    id: 'traditional-events',
    name: 'Traditional Events',
    shortName: 'Traditional',
    description: 'Full coverage for Heena nights, traditional marriages, and receptions.',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    packages: [
      {
        id: 'trad-reception-bronze',
        name: 'Reception – Bronze',
        price: 400,
        duration: 'Start of program – midnight',
        includes: ['Pre-reception photos', 'Outdoor photoshoot', 'Reception coverage', 'Photos on a flash drive'],
      },
      {
        id: 'trad-reception-silver',
        name: 'Reception – Silver',
        price: 500,
        duration: 'Start of program – midnight',
        includes: ['Pre-reception photos', 'Outdoor photoshoot', 'Reception coverage', 'Photos on a flash drive', 'Two A3 Frames'],
      },
      {
        id: 'trad-reception-gold',
        name: 'Reception – Gold',
        price: 800,
        duration: 'Start of program – midnight',
        includes: ['Pre-reception photos', 'Outdoor photoshoot', 'Reception coverage', 'Photos on a flash drive', 'A3 photobook', 'Highlight video', 'Two A2 frames'],
      },
      {
        id: 'trad-heena-bronze',
        name: 'Heena Night – Bronze',
        price: 300,
        duration: 'Start of program – midnight',
        includes: ['Pre-Heena photos', 'Outdoor photoshoot', 'Heena party coverage', 'Photos on a flash drive'],
      },
      {
        id: 'trad-heena-silver',
        name: 'Heena Night – Silver',
        price: 400,
        duration: 'Start of program – midnight',
        includes: ['Pre-Heena photos', 'Outdoor photoshoot', 'Heena party coverage', 'Photos on a flash drive', 'Two A3 Frames'],
      },
      {
        id: 'trad-heena-gold',
        name: 'Heena Night – Gold',
        price: 600,
        duration: 'Start of program – midnight',
        includes: ['Pre-Heena photos', 'Outdoor photoshoot', 'Heena party coverage', 'Photos on a flash drive', 'Two A2 frames', 'Highlight video', 'A3 photobook'],
      },
      {
        id: 'trad-marriage-bronze',
        name: 'Traditional Marriage – Bronze',
        price: 400,
        duration: 'Start of program – midnight',
        includes: ['Pre-ceremony photos', 'Outdoor photoshoot', 'Ceremony coverage', 'Photos on a flash drive'],
      },
      {
        id: 'trad-marriage-silver',
        name: 'Traditional Marriage – Silver',
        price: 500,
        duration: 'Start of program – midnight',
        includes: ['Pre-ceremony photos', 'Outdoor photoshoot', 'Ceremony coverage', 'Photos on a flash drive', 'Two A3 Frames'],
      },
      {
        id: 'trad-marriage-gold',
        name: 'Traditional Marriage – Gold',
        price: 800,
        duration: 'Start of program – midnight',
        includes: ['Pre-ceremony photos', 'Outdoor photoshoot', 'Ceremony coverage', 'Photos on a flash drive', 'A3 photobook', 'Highlight video', 'Two A2 frames'],
      },
    ],
  },
  {
    id: 'real-estate-video',
    name: 'Real Estate Videography',
    shortName: 'Property Video',
    description: 'Cinematic property walkthroughs that make listings stand out.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    packages: [
      {
        id: 're-video-basic',
        name: 'Residential – Basic',
        price: 200,
        duration: '1–2 minute walkthrough',
        includes: ['Simple editing', 'Basic transitions'],
      },
      {
        id: 're-video-standard',
        name: 'Residential – Standard',
        price: 350,
        duration: '3–4 minute walkthrough + exterior',
        includes: ['Music', 'Basic color correction'],
      },
      {
        id: 're-video-premium',
        name: 'Residential – Premium',
        price: 500,
        duration: '5+ minute cinematic video',
        includes: ['Drone shots', 'Smooth transitions', 'Color grading', 'Music'],
      },
      {
        id: 're-video-mini-commercial',
        name: 'Mini Commercial Video',
        price: 300,
        duration: '2–3 minute walkthrough',
        description: 'For small offices or retail.',
        includes: ['Interior walkthrough', 'Basic editing'],
      },
      {
        id: 're-video-standard-commercial',
        name: 'Standard Commercial Video',
        price: 500,
        duration: '4–5 minute with drone',
        includes: ['Drone footage', 'Interior walkthroughs', 'Exterior shots'],
      },
      {
        id: 're-video-full-commercial',
        name: 'Full Commercial Video',
        price: 800,
        duration: '6+ minute cinematic',
        description: 'For large office buildings, complexes, or showrooms.',
        includes: ['Aerial shots', 'B-roll', 'Full editing'],
      },
    ],
    addOns: [
      { id: 're-video-voiceover', name: 'Voiceover', price: 100 },
      { id: 're-video-listing', name: 'Real Estate Listing Video (30–60s)', price: 150 },
      { id: 're-video-same-day', name: 'Same-Day Delivery', price: 100 },
      { id: 're-video-edit-only', name: 'Editing Only (raw footage)', price: 200 },
    ],
  },
  {
    id: 'documentary-video',
    name: 'Documentary Videography',
    shortName: 'Documentary Film',
    description: 'From short-form docs to full feature-length films — your story, cinematically told.',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
    packages: [
      {
        id: 'doc-video-basic',
        name: 'Basic Documentary',
        price: 1200,
        duration: '3–5 minutes',
        includes: ['Single-camera shoot', 'Basic editing & color correction', 'Music & sound design'],
      },
      {
        id: 'doc-video-standard',
        name: 'Standard Documentary',
        price: 2000,
        duration: '7–10 minutes',
        includes: ['Multi-camera shoot', 'Interviews (up to 2 subjects)', 'On-location B-roll', 'Intermediate editing (music, sound mixing, color grading)'],
      },
      {
        id: 'doc-video-premium',
        name: 'Premium Documentary',
        price: 5000,
        duration: '15–30 minutes',
        includes: ['Multi-camera + additional crew', 'Up to 5 interviews', 'Extensive B-roll', 'Advanced editing, sound mixing & color grading', 'Music licensing', 'Custom graphics/animations (if required)'],
      },
      {
        id: 'doc-video-feature',
        name: 'Feature-Length Documentary',
        price: 10000,
        duration: '45–90 minutes',
        includes: ['Full-scale production (multi-camera, large crew)', 'Up to 10+ interviews', 'Extensive B-roll & drone footage', 'In-depth editing, sound design & custom animations', 'Music licensing', 'Research & scriptwriting (if needed)'],
      },
    ],
    addOns: [
      { id: 'doc-video-drone', name: 'Drone Footage', price: 500 },
      { id: 'doc-video-voiceover', name: 'Voiceover', price: 400 },
      { id: 'doc-video-edit-only', name: 'Editing Only (raw footage)', price: 1500 },
      { id: 'doc-video-bts', name: 'Behind-the-Scenes Footage', price: 600 },
    ],
  },
  {
    id: 'billboard',
    name: 'Billboard Photography',
    shortName: 'Billboard',
    description: 'High-impact creative shoots for billboard and large-format print campaigns.',
    image: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=800&q=80',
    packages: [
      {
        id: 'billboard-standard',
        name: 'Billboard Package',
        price: 850,
        duration: '1-day creative shoot',
        includes: ['Creative fee (1-day shoot): $700', 'Retouching (3 final images): $150'],
      },
    ],
  },
];
