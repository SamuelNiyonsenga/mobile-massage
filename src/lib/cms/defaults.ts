/**
 * Content types and starter content. This is what the site shows until someone
 * edits and publishes in the CMS. Copy is taken from the Mobile Massage flyer.
 */

export interface Link {
  label: string;
  href: string;
}

export type IconName = 'lotus' | 'torso' | 'back' | 'body' | 'stones' | 'home' | 'hotel' | 'pin';

export interface HomeContent {
  seo: { title: string; description: string; shareImage: string; noindex: boolean };
  hero: {
    eyebrow: string;
    headline: string;
    script: string;
    subheadline: string;
    quote: string;
    secondaryCta: Link;
    /** Wide background photo behind the title. Leave empty for the built-in glow. */
    image: string;
    imageAlt: string;
    /** Optional silent looping video, plays behind the title */
    video: string;
    picker: {
      title: string;
      buttonLabel: string;
      places: string[];
      treatments: string[];
      messageTemplate: string;
    };
  };
  intro: { visible: boolean; eyebrow: string; title: string; text: string; image: string; imageAlt: string };
  band: { visible: boolean; headline: string; text: string; cta: Link; image: string; imageAlt: string };
  places: {
    visible: boolean;
    title: string;
    intro: string;
    buttonLabel: string;
    items: { icon: IconName; title: string; text: string; image: string; imageAlt: string }[];
  };
  why: { visible: boolean; title: string; text: string; points: string[]; image: string; imageAlt: string };
  services: {
    visible: boolean;
    title: string;
    intro: string;
    moreLabel: string;
    items: { icon: IconName; name: string; description: string; price: string }[];
  };
  process: {
    visible: boolean;
    title: string;
    intro: string;
    steps: { title: string; text: string }[];
  };
  gallery: {
    visible: boolean;
    title: string;
    intro: string;
    items: { kind: 'image' | 'video'; src: string; poster: string; alt: string; caption: string }[];
  };
  testimonials: {
    visible: boolean;
    title: string;
    items: { quote: string; name: string; detail: string }[];
  };
  faq: { visible: boolean; title: string; items: { question: string; answer: string }[] };
  cta: { visible: boolean; title: string; text: string; buttonLabel: string; thanks: string; image: string };
}

export interface AboutContent {
  seo: { title: string; description: string; shareImage: string; noindex: boolean };
  intro: { headline: string; script: string; text: string; image: string; imageAlt: string };
  story: { visible: boolean; title: string; text: string };
  principles: {
    visible: boolean;
    title: string;
    items: { icon: IconName; title: string; text: string }[];
  };
  therapist: { visible: boolean; name: string; role: string; photo: string; photoAlt: string; bio: string };
  credentials: { visible: boolean; title: string; intro: string; items: string[] };
  area: { visible: boolean; title: string; text: string; buttonLabel: string };
  cta: HomeContent['cta'];
}

export interface TreatmentEntry {
  name: string;
  /** Treatments with the same group name are shown together */
  category: string;
  icon: IconName;
  tagline: string;
  description: string;
  /** Short "good for" points */
  goodFor: string[];
  /** One per line: "60 minutes | RWF 30,000". The price part is optional. */
  options: string[];
  image: string;
  imageAlt: string;
}

export interface CollectionContent {
  seo: { title: string; description: string; shareImage: string; noindex: boolean };
  intro: { eyebrow: string; headline: string; text: string; image: string; imageAlt: string };
  menu: { title: string; intro: string; note: string; items: TreatmentEntry[] };
  gallery: HomeContent['gallery'];
  guide: { visible: boolean; title: string; text: string; items: { title: string; text: string }[] };
  cta: HomeContent['cta'];
}

export interface ContactContent {
  seo: { title: string; description: string; shareImage: string; noindex: boolean };
  intro: { eyebrow: string; headline: string; text: string; image: string; imageAlt: string };
  details: { title: string; text: string };
  form: { title: string; text: string; buttonLabel: string; notePlaceholder: string };
  areas: { visible: boolean; title: string; text: string };
  cta: HomeContent['cta'];
}

export interface SiteContent {
  brand: { name: string; descriptor: string; tagline: string };
  seo: {
    siteUrl: string;
    shareImage: string;
    googleVerification: string;
    areaServed: string[];
    social: string[];
  };
  nav: { items: Link[] };
  cta: { label: string };
  contact: { phone: string; whatsapp: string; email: string; hours: string; serviceArea: string };
  footer: { blurb: string; groups: { title: string; links: Link[] }[]; legal: string };
}

const CTA_DEFAULT: HomeContent['cta'] = {
  visible: true,
  title: 'Ready to relax?',
  text: 'Send me a message and I will come to you.',
  buttonLabel: 'Book now on WhatsApp',
  thanks: 'Thank you for your support',
  image: '',
};

export const HOME_DEFAULTS: HomeContent = {
  seo: {
    title: 'Mobile Massage Home Service Kigali | At your place',
    description:
      'Professional massage at your home, hotel or anywhere you are in Kigali. Swedish, deep tissue, relaxation, back and shoulder and full body. Book on WhatsApp.',
    shareImage: '',
    noindex: false,
  },
  hero: {
    eyebrow: 'Welcome to',
    headline: 'Mobile Massage',
    script: 'Home Service · Kigali',
    subheadline: 'Professional massage at your home, hotel or anywhere you are. Choose a treatment, tell me where, and I will come to you.',
    quote: 'Your comfort is my priority',
    secondaryCta: { label: 'Explore the collection', href: '/collection' },
    image: '',
    imageAlt: '',
    video: '',
    picker: {
      title: 'Book your massage',
      buttonLabel: 'Book on WhatsApp',
      places: ['Home service', 'Hotel service', 'Anywhere you are'],
      treatments: [
        'Swedish massage',
        'Deep tissue massage',
        'Relaxation massage',
        'Back and shoulder massage',
        'Full body massage',
      ],
      messageTemplate: "Hello, I'd like to book a {treatment}. Place: {place}.",
    },
  },
  intro: {
    visible: true,
    eyebrow: 'Luxury mobile massage in Kigali',
    title: 'Where relaxation begins',
    text: 'Getting to a spa takes time and energy, and the journey can use up some of the calm before the treatment even starts. Mobile Massage Home Service takes that step away.\n\nChoose from five treatments, then tell me where you would like me to come: your home, your hotel room or anywhere you are in Kigali. Your comfort is my priority.',
    image: '/hero.jpg',
    imageAlt: 'A woman resting on rolled towels while her shoulders are massaged, with candles and frangipani flowers beside her',
  },
  band: {
    visible: true,
    headline: 'Step into stillness.\nLet me come to you.',
    text: 'A sanctuary of deep relaxation and calm, brought to your door.',
    cta: { label: 'Explore the collection', href: '/collection' },
    image: '',
    imageAlt: '',
  },
  places: {
    visible: true,
    title: 'Wherever you are in Kigali',
    intro: 'No travelling before or after. Tell me where and I will be there.',
    buttonLabel: 'Book now',
    items: [
      { icon: 'home', title: 'Home service', text: 'Your own space, no travel.', image: '', imageAlt: '' },
      { icon: 'hotel', title: 'Hotel service', text: 'Unwind in your room.', image: '', imageAlt: '' },
      { icon: 'pin', title: 'Anywhere you are', text: 'Tell me where and I will be there.', image: '', imageAlt: '' },
    ],
  },
  why: {
    visible: true,
    title: 'More than a massage. A calmer way to unwind.',
    text: 'A massage works best when you do not have to rush to or from it. Mobile Massage Home Service brings the treatment to you, so you can relax before, during and after.',
    points: [
      'No travelling. I come to you',
      'Five treatments for tension, stress and stiffness',
      'At home, in your hotel or anywhere you are',
      'Book with a single WhatsApp message',
    ],
    image: '',
    imageAlt: '',
  },
  services: {
    visible: true,
    title: 'The collection',
    intro: 'Five ways to unwind. Not sure which one? Message me and I will help you choose.',
    moreLabel: 'View the full collection',
    items: [
      { icon: 'lotus', name: 'Swedish massage', description: 'Relax your body and mind.', price: '' },
      { icon: 'torso', name: 'Deep tissue massage', description: 'Relieve tension and pain.', price: '' },
      { icon: 'lotus', name: 'Relaxation massage', description: 'Feel calm and refreshed.', price: '' },
      { icon: 'back', name: 'Back and shoulder massage', description: 'Ease stress and stiffness.', price: '' },
      { icon: 'body', name: 'Full body massage', description: 'Total care and relaxation.', price: '' },
    ],
  },
  process: {
    visible: true,
    title: 'How booking works',
    intro: 'It takes one message.',
    steps: [
      { title: 'Message me on WhatsApp', text: 'Tap Book on WhatsApp. Your choices are filled in for you.' },
      { title: 'Confirm time and place', text: 'We agree a time and where you would like me to come.' },
      { title: 'I come to you', text: 'I arrive at your home, hotel or chosen place.' },
      { title: 'Relax and feel better', text: 'Switch off and enjoy your treatment.' },
    ],
  },
  gallery: {
    visible: true,
    title: 'Photos and videos',
    intro: 'A look at the treatments and the calm they bring.',
    items: [],
  },
  testimonials: {
    visible: false,
    title: 'What clients say',
    items: [
      { quote: 'Sample quote. Replace with real client feedback before turning this section on.', name: 'Client name', detail: 'Treatment, month' },
      { quote: 'Sample quote. Replace with real client feedback before turning this section on.', name: 'Client name', detail: 'Treatment, month' },
      { quote: 'Sample quote. Replace with real client feedback before turning this section on.', name: 'Client name', detail: 'Treatment, month' },
    ],
  },
  faq: {
    visible: true,
    title: 'Questions people ask',
    items: [
      { question: 'Where do you come to?', answer: 'I offer home service and hotel service in Kigali, and I can come to anywhere you are. Message me your location to check.' },
      { question: 'How do I book?', answer: 'Tap Book on WhatsApp or use the booking form on the Contact page. Tell me the treatment, the place and the time you would like.' },
      { question: 'Which massage should I choose?', answer: 'Swedish and relaxation massage are for calm and rest. Deep tissue and back and shoulder massage target tension, pain and stiffness. Full body massage covers everything. If you are unsure, just ask.' },
      { question: 'How much does it cost?', answer: 'The price depends on the treatment and how long you would like it to be. Message me on WhatsApp for current prices.' },
    ],
  },
  cta: { ...CTA_DEFAULT },
};

export const ABOUT_DEFAULTS: AboutContent = {
  seo: {
    title: 'About Mobile Massage Home Service | Kigali',
    description:
      'Mobile Massage Home Service is a professional massage service that comes to your home, hotel or anywhere you are in Kigali. Learn how it works.',
    shareImage: '',
    noindex: false,
  },
  intro: {
    headline: 'Massage that comes to you.',
    script: 'Relax, Rejuvenate, Feel Better',
    text: 'Mobile Massage Home Service is a professional massage service that works at your place. Instead of travelling to a spa, you choose a treatment and I come to your home, your hotel or wherever you are in Kigali.',
    image: '/hero.jpg',
    imageAlt: 'A woman resting on rolled towels while her shoulders are massaged, with candles and frangipani flowers beside her',
  },
  story: {
    visible: true,
    title: 'The idea behind Mobile Massage',
    text: 'Getting to a spa takes time and energy, and the journey can use up some of the calm before the treatment even starts. Mobile Massage takes that step away.\n\nYou choose from five treatments: Swedish, deep tissue, relaxation, back and shoulder, and full body massage. Then you tell me where you would like me to come, and I bring the treatment to you.\n\nEvery session is built around one promise: your comfort is my priority.',
  },
  principles: {
    visible: true,
    title: 'What to expect',
    items: [
      { icon: 'lotus', title: 'Comfort comes first', text: 'Your comfort is my priority. A session is shaped around how you feel and what you need.' },
      { icon: 'pin', title: 'I come to you', text: 'At home, in your hotel or anywhere you are, so there is no travelling before or after.' },
      { icon: 'back', title: 'A treatment for how you feel', text: 'Relax with a Swedish or relaxation massage, or ease tension and stiffness with deep tissue or back and shoulder work.' },
    ],
  },
  therapist: { visible: true, name: '', role: '', photo: '', photoAlt: '', bio: '' },
  credentials: { visible: true, title: 'Training and qualifications', intro: '', items: [] },
  area: {
    visible: true,
    title: 'Where I work',
    text: 'I offer home service and hotel service in Kigali, and I can come to anywhere you are. Message me your location and I will confirm.',
    buttonLabel: 'Check my area on WhatsApp',
  },
  cta: { ...CTA_DEFAULT },
};

export const COLLECTION_DEFAULTS: CollectionContent = {
  seo: {
    title: 'Massage Collection Kigali | Mobile Massage Home Service',
    description:
      'Swedish, deep tissue, relaxation, back and shoulder and full body massage, brought to your home or hotel in Kigali. See the collection and book on WhatsApp.',
    shareImage: '',
    noindex: false,
  },
  intro: {
    eyebrow: 'The collection',
    headline: 'Five ways to unwind',
    text: 'Every treatment comes to you, at home, in your hotel or anywhere you are in Kigali. Pick the one that suits how you feel, then book in one message.',
    image: '',
    imageAlt: '',
  },
  menu: {
    title: 'Our treatments',
    intro: 'Tap Book on any treatment and your choice is filled in on WhatsApp for you.',
    note: 'Prices and times are confirmed when you book.',
    items: [
      {
        name: 'Swedish massage',
        category: 'Relax',
        icon: 'lotus',
        tagline: 'Long, flowing strokes to help you unwind.',
        description: 'A classic full-body style with smooth, rhythmic movements and light to medium pressure. A gentle way to slow down and switch off.',
        goodFor: ['A first massage', 'Winding down after a long week', 'Light to medium pressure'],
        options: [],
        image: '',
        imageAlt: '',
      },
      {
        name: 'Relaxation massage',
        category: 'Relax',
        icon: 'lotus',
        tagline: 'Slow, soothing and quiet.',
        description: 'A calm, unhurried massage with gentle pressure, made for switching off completely and feeling refreshed.',
        goodFor: ['Gentle pressure', 'Switching off after a busy day', 'Pure rest'],
        options: [],
        image: '',
        imageAlt: '',
      },
      {
        name: 'Deep tissue massage',
        category: 'Release',
        icon: 'torso',
        tagline: 'Firmer, focused pressure where you hold tension.',
        description: 'Slower, deeper work on the areas that feel tight, with the pressure agreed with you throughout. For people who like a firmer touch.',
        goodFor: ['Tight shoulders and back', 'A firmer pressure', 'Long days sitting or on your feet'],
        options: [],
        image: '',
        imageAlt: '',
      },
      {
        name: 'Back and shoulder massage',
        category: 'Release',
        icon: 'back',
        tagline: 'Focused care for the areas that carry the day.',
        description: 'Concentrated work on the back, shoulders and neck, where many people hold stress and stiffness.',
        goodFor: ['Desk and screen days', 'Stiff shoulders', 'A targeted session'],
        options: [],
        image: '',
        imageAlt: '',
      },
      {
        name: 'Full body massage',
        category: 'Complete',
        icon: 'body',
        tagline: 'Head to toe, nothing missed.',
        description: 'A complete treatment that brings the whole body into the session, for total care and relaxation.',
        goodFor: ['Total relaxation', 'A special treat', 'Hotel stays'],
        options: [],
        image: '',
        imageAlt: '',
      },
    ],
  },
  gallery: {
    visible: true,
    title: 'Photo gallery',
    intro: 'A look at the treatments and the calm they bring to your space.',
    items: [],
  },
  guide: {
    visible: true,
    title: 'Not sure which to choose?',
    text: 'A quick guide. Still unsure? Message me and I will help you decide.',
    items: [
      { title: 'I want to switch off', text: 'Choose a Swedish or relaxation massage.' },
      { title: 'I feel tight or stiff', text: 'Choose a deep tissue or back and shoulder massage.' },
      { title: 'I want the full experience', text: 'Choose a full body massage.' },
    ],
  },
  cta: { ...CTA_DEFAULT, title: 'Found the one for you?', text: 'Send me a message with your choice and I will come to you.' },
};

export const CONTACT_DEFAULTS: ContactContent = {
  seo: {
    title: 'Contact Mobile Massage Home Service | Kigali',
    description:
      'Book a massage at your home or hotel in Kigali. Send a booking request on WhatsApp, call, or message to check that I can reach your area.',
    shareImage: '',
    noindex: false,
  },
  intro: {
    eyebrow: 'Contact us',
    headline: 'Let us plan your massage',
    text: 'Tell me the treatment, the place and a time that suits you. I will confirm everything on WhatsApp.',
    image: '',
    imageAlt: '',
  },
  details: {
    title: 'Reach me directly',
    text: 'The quickest way to book is WhatsApp. You can also call.',
  },
  form: {
    title: 'Request a booking',
    text: 'Fill in what you know. Your request opens in WhatsApp, ready to send.',
    buttonLabel: 'Send on WhatsApp',
    notePlaceholder: 'Anything I should know, e.g. a floor number, or an area you would like me to focus on',
  },
  areas: {
    visible: true,
    title: 'Where I come',
    text: 'Home service, hotel service and anywhere you are in Kigali. Not sure I reach you? Just ask.',
  },
  cta: { ...CTA_DEFAULT, title: 'Prefer to chat?', text: 'Message me on WhatsApp and I will reply as soon as I can.' },
};

export const SITE_DEFAULTS: SiteContent = {
  brand: { name: 'Mobile Massage', descriptor: 'Home Service · Kigali', tagline: 'Relax, Rejuvenate, Feel Better' },
  seo: { siteUrl: '', shareImage: '', googleVerification: '', areaServed: ['Kigali'], social: [] },
  nav: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'About us', href: '/about' },
      { label: 'Collection', href: '/collection' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  cta: { label: 'Book now' },
  contact: {
    phone: '0796907746',
    whatsapp: '250796907746',
    email: '',
    hours: '',
    serviceArea: 'Kigali, Rwanda. Home service, hotel service and anywhere you are',
  },
  footer: {
    blurb: 'Professional massage at your home or hotel in Kigali. I come to you.',
    groups: [
      {
        title: 'Explore',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Collection', href: '/collection' },
          { label: 'How booking works', href: '/#booking' },
          { label: 'Questions', href: '/#faq' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About us', href: '/about' },
          { label: 'Contact us', href: '/contact' },
        ],
      },
    ],
    legal: 'All rights reserved.',
  },
};
