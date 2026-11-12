import type { DocDef, Field } from './types';
import { ABOUT_DEFAULTS, COLLECTION_DEFAULTS, CONTACT_DEFAULTS, HOME_DEFAULTS, SITE_DEFAULTS } from './defaults';

const visible: Field = {
  name: 'visible',
  label: 'Show this section on the page',
  type: 'boolean',
};

const galleryGroup = (max: number): Field => ({
  name: 'gallery',
  label: 'Photos and videos',
  type: 'group',
  fields: [
    visible,
    { name: 'title', label: 'Heading', type: 'text' },
    { name: 'intro', label: 'Introduction', type: 'textarea', rows: 2 },
    {
      name: 'items',
      label: 'Photos and videos',
      type: 'list',
      itemNoun: 'photo or video',
      titleField: 'caption',
      max: max,
      help: 'The section stays hidden until you add something. Photos open large when tapped. Videos play in place.',
      fields: [
        {
          name: 'kind',
          label: 'Type',
          type: 'select',
          options: [
            { label: 'Photo', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'src',
          label: 'File or link',
          type: 'media',
          help: 'Upload, choose from the library, or paste a YouTube or Vimeo link for a video.',
        },
        { name: 'poster', label: 'Video cover photo (optional)', type: 'image', help: 'Shown before an uploaded video plays.' },
        { name: 'alt', label: 'Description for screen readers and search', type: 'text', help: 'Say what is in the photo or video, e.g. "Back and shoulder massage at a hotel".' },
        { name: 'caption', label: 'Caption (optional)', type: 'text' },
      ],
    },
  ],
});

const ICON_OPTIONS = [
  { label: 'Lotus', value: 'lotus' },
  { label: 'Shoulders', value: 'torso' },
  { label: 'Back', value: 'back' },
  { label: 'Full body', value: 'body' },
  { label: 'Hot stones', value: 'stones' },
  { label: 'Home', value: 'home' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Location pin', value: 'pin' },
];

const link = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'href', label: 'Link', type: 'url', placeholder: '/contact or https://…' },
  ],
});

const linkList = (name: string, label: string, noun = 'link'): Field => ({
  name,
  label,
  type: 'list',
  itemNoun: noun,
  titleField: 'label',
  fields: [
    { name: 'label', label: 'Label', type: 'text' },
    { name: 'href', label: 'Link', type: 'url', placeholder: '/contact or https://…' },
  ],
});

const seoGroup = (page: string): Field => ({
  name: 'seo',
  label: 'Search and sharing',
  type: 'group',
  fields: [
    { name: 'title', label: 'Page title', type: 'text', counter: { min: 30, max: 60 }, help: `The blue link in Google for the ${page}.` },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3, counter: { min: 110, max: 160 }, help: 'The grey text under the link in Google.' },
    { name: 'shareImage', label: 'Share image', type: 'image', help: 'Shown when the page is shared on WhatsApp and social media. 1200 x 630 pixels works best.' },
    { name: 'noindex', label: 'Hide this page from search engines', type: 'boolean', help: 'Leave off for a live site.' },
  ],
});

const ctaGroup: Field = {
  name: 'cta',
  label: 'Closing call to action',
  type: 'group',
  fields: [
    visible,
    { name: 'title', label: 'Heading', type: 'text' },
    { name: 'text', label: 'Text', type: 'textarea', rows: 2 },
    { name: 'buttonLabel', label: 'Button label', type: 'text' },
    { name: 'thanks', label: 'Handwritten thank-you', type: 'text' },
    { name: 'image', label: 'Background photo (optional)', type: 'image', help: 'A wide photo shown softly behind the text.' },
  ],
};

export const HOME_DEF: DocDef = {
  key: 'home',
  title: 'Home page',
  description: 'Everything on the front page, section by section.',
  viewPath: '/',
  fields: [
    {
      name: 'seo',
      label: 'Search and sharing',
      type: 'group',
      fields: [
        { name: 'title', label: 'Page title', type: 'text', counter: { min: 30, max: 60 }, help: 'The blue link in Google. Put what you do and where first, e.g. "Mobile massage at your home or hotel".' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3, counter: { min: 110, max: 160 }, help: 'The grey text under the link in Google. Mention what you offer, where, and how to book.' },
        { name: 'shareImage', label: 'Share image', type: 'image', help: 'Shown when the page is shared on WhatsApp, Facebook and similar. 1200 x 630 pixels works best. Falls back to the hero photo.' },
        { name: 'noindex', label: 'Hide this page from search engines', type: 'boolean', help: 'Leave off for a live site.' },
      ],
    },
    {
      name: 'hero',
      label: 'Hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', label: 'Small line above the title', type: 'text', placeholder: 'Welcome to' },
        { name: 'headline', label: 'Title', type: 'text', help: 'The large name across the top of the page.' },
        { name: 'script', label: 'Line under the title', type: 'text' },
        { name: 'subheadline', label: 'Supporting text', type: 'textarea', rows: 3 },
        { name: 'quote', label: 'Small tagline', type: 'text' },
        link('secondaryCta', 'Secondary link'),
        {
          name: 'image',
          label: 'Background photo',
          type: 'image',
          help: 'A wide, landscape photo of at least 1600 pixels across works best. It sits behind the title under a dark veil. Leave empty to use the built-in glow.',
        },
        { name: 'imageAlt', label: 'Photo description', type: 'text', help: 'Read aloud by screen readers and used by search engines.' },
        {
          name: 'video',
          label: 'Background video (optional)',
          type: 'media',
          help: 'A short silent loop (MP4 or WebM, under 50 MB) that plays behind the title. The photo shows while it loads.',
        },
        {
          name: 'picker',
          label: 'Booking picker',
          type: 'group',
          fields: [
            { name: 'title', label: 'Question', type: 'text' },
            { name: 'buttonLabel', label: 'Button label', type: 'text' },
            { name: 'places', label: 'Places', type: 'stringList' },
            { name: 'treatments', label: 'Treatments', type: 'stringList' },
            {
              name: 'messageTemplate',
              label: 'WhatsApp message',
              type: 'text',
              help: 'The message the visitor sends. {treatment} and {place} are replaced with their choices.',
            },
          ],
        },
      ],
    },
    {
      name: 'intro',
      label: 'Welcome text',
      type: 'group',
      fields: [
        visible,
        { name: 'eyebrow', label: 'Small heading', type: 'text' },
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 6, help: 'Leave a blank line between paragraphs.' },
        { name: 'image', label: 'Photo', type: 'image', help: 'Shown in an arch beside the text. Portrait photos work best.' },
        { name: 'imageAlt', label: 'Photo description', type: 'text' },
      ],
    },
    {
      name: 'band',
      label: 'Feature band',
      type: 'group',
      fields: [
        visible,
        { name: 'headline', label: 'Headline', type: 'textarea', rows: 2, help: 'Press Enter to start a new line.' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 2 },
        link('cta', 'Button'),
        { name: 'image', label: 'Background photo', type: 'image', help: 'A wide photo behind the words. Leave empty for a rich dark background.' },
        { name: 'imageAlt', label: 'Photo description', type: 'text' },
      ],
    },
    {
      name: 'places',
      label: 'Where I come',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'intro', label: 'Introduction', type: 'text' },
        { name: 'buttonLabel', label: 'Button label on each card', type: 'text' },
        {
          name: 'items',
          label: 'Places',
          type: 'list',
          itemNoun: 'place',
          titleField: 'title',
          max: 6,
          fields: [
            { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'text', label: 'Short text', type: 'text' },
            { name: 'image', label: 'Card photo (optional)', type: 'image' },
            { name: 'imageAlt', label: 'Photo description', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'services',
      label: 'Collection preview',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'intro', label: 'Introduction', type: 'textarea', rows: 3 },
        { name: 'moreLabel', label: 'Link to the full collection', type: 'text' },
        {
          name: 'items',
          label: 'Treatments',
          type: 'list',
          itemNoun: 'treatment',
          titleField: 'name',
          fields: [
            { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
            { name: 'price', label: 'Price', type: 'text', help: 'Optional. Leave empty to hide the price.', placeholder: 'From 20,000 RWF' },
          ],
        },
      ],
    },
    {
      name: 'process',
      label: 'How booking works',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'intro', label: 'Introduction', type: 'textarea', rows: 2 },
        {
          name: 'steps',
          label: 'Steps (shown in this order)',
          type: 'list',
          itemNoun: 'step',
          titleField: 'title',
          max: 6,
          fields: [
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'text', label: 'Text', type: 'textarea', rows: 2 },
          ],
        },
      ],
    },
    {
      name: 'why',
      label: 'Why book with me',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 4 },
        { name: 'points', label: 'Points', type: 'stringList', help: 'Only list things that are true for your service. Shown as cards (up to 4 look best).' },
        { name: 'image', label: 'Background photo (optional)', type: 'image', help: 'A wide photo shown softly behind the cards.' },
        { name: 'imageAlt', label: 'Photo description', type: 'text' },
      ],
    },
    galleryGroup(24),
    {
      name: 'testimonials',
      label: 'Client reviews',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        {
          name: 'items',
          label: 'Reviews',
          type: 'list',
          itemNoun: 'review',
          titleField: 'name',
          max: 6,
          fields: [
            { name: 'quote', label: 'Quote', type: 'textarea', rows: 4, help: 'Use real feedback, with the client’s permission.' },
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'detail', label: 'Detail', type: 'text', placeholder: 'Deep tissue, October' },
          ],
        },
      ],
    },
    {
      name: 'faq',
      label: 'Questions',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        {
          name: 'items',
          label: 'Questions',
          type: 'list',
          itemNoun: 'question',
          titleField: 'question',
          fields: [
            { name: 'question', label: 'Question', type: 'text' },
            { name: 'answer', label: 'Answer', type: 'textarea', rows: 4 },
          ],
        },
      ],
    },
    ctaGroup,
  ],
};

export const ABOUT_DEF: DocDef = {
  key: 'about',
  title: 'About us page',
  description: 'Your story, what to expect, and a profile of the therapist.',
  viewPath: '/about',
  fields: [
    {
      name: 'seo',
      label: 'Search and sharing',
      type: 'group',
      fields: [
        { name: 'title', label: 'Page title', type: 'text', counter: { min: 30, max: 60 }, help: 'The blue link in Google. Include your business name and what you do.' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 3, counter: { min: 110, max: 160 }, help: 'The grey text under the link in Google.' },
        { name: 'shareImage', label: 'Share image', type: 'image', help: 'Shown when the page is shared on WhatsApp, Facebook and similar. Falls back to the main photo on this page.' },
        { name: 'noindex', label: 'Hide this page from search engines', type: 'boolean', help: 'Leave off for a live site.' },
      ],
    },
    {
      name: 'intro',
      label: 'Introduction',
      type: 'group',
      fields: [
        { name: 'headline', label: 'Headline', type: 'text' },
        { name: 'script', label: 'Handwritten line', type: 'text', help: 'Shown in the brush script under the headline.' },
        { name: 'text', label: 'Introduction', type: 'textarea', rows: 5 },
        { name: 'image', label: 'Main photo', type: 'image', help: 'Portrait photos work best. A photo of you at work builds the most trust.' },
        { name: 'imageAlt', label: 'Photo description', type: 'text', help: 'Read aloud by screen readers and used by search engines.' },
      ],
    },
    {
      name: 'story',
      label: 'Story',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 12, help: 'Leave a blank line between paragraphs. The first paragraph is shown larger.' },
      ],
    },
    {
      name: 'principles',
      label: 'What to expect',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        {
          name: 'items',
          label: 'Points',
          type: 'list',
          itemNoun: 'point',
          titleField: 'title',
          max: 6,
          fields: [
            { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'text', label: 'Text', type: 'textarea', rows: 3 },
          ],
        },
      ],
    },
    {
      name: 'therapist',
      label: 'Therapist profile',
      type: 'group',
      fields: [
        visible,
        { name: 'name', label: 'Name', type: 'text', help: 'The section stays hidden until you add a name or a bio. Clients book with someone they can picture, so this is worth filling in.' },
        { name: 'role', label: 'Role', type: 'text', placeholder: 'Massage therapist' },
        { name: 'photo', label: 'Photo', type: 'image' },
        { name: 'photoAlt', label: 'Photo description', type: 'text' },
        { name: 'bio', label: 'About you', type: 'textarea', rows: 8, help: 'Leave a blank line between paragraphs. Only write what is true.' },
      ],
    },
    {
      name: 'credentials',
      label: 'Qualifications',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'intro', label: 'Introduction (optional)', type: 'textarea', rows: 3 },
        {
          name: 'items',
          label: 'Qualifications and training',
          type: 'stringList',
          help: 'The section stays hidden until you add one. List only real certificates, courses and memberships.',
        },
      ],
    },
    {
      name: 'area',
      label: 'Where I work',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 4, help: 'The towns you list under Site settings, Search and social, appear below this text.' },
        { name: 'buttonLabel', label: 'Button label', type: 'text', help: 'Opens WhatsApp.' },
      ],
    },
    ctaGroup,
  ],
};

export const COLLECTION_DEF: DocDef = {
  key: 'collection',
  title: 'Collection page',
  description: 'Your full treatment menu, with prices and a Book button on each treatment.',
  viewPath: '/collection',
  fields: [
    seoGroup('Collection page'),
    {
      name: 'intro',
      label: 'Page introduction',
      type: 'group',
      fields: [
        { name: 'eyebrow', label: 'Small heading', type: 'text' },
        { name: 'headline', label: 'Headline', type: 'text' },
        { name: 'text', label: 'Introduction', type: 'textarea', rows: 4 },
        { name: 'image', label: 'Background photo (optional)', type: 'image', help: 'A wide photo behind the headline, under a dark veil.' },
        { name: 'imageAlt', label: 'Photo description', type: 'text' },
      ],
    },
    {
      name: 'menu',
      label: 'Treatments',
      type: 'group',
      fields: [
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'intro', label: 'Introduction', type: 'text' },
        { name: 'note', label: 'Note under the menu', type: 'text', help: 'e.g. "Prices are in RWF and confirmed when you book."' },
        {
          name: 'items',
          label: 'Treatments',
          type: 'list',
          itemNoun: 'treatment',
          titleField: 'name',
          max: 30,
          help: 'Treatments with the same Group are shown together under one heading, in the order you list them.',
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'category', label: 'Group', type: 'text', help: 'e.g. Relax, Release, Complete.' },
            { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
            { name: 'tagline', label: 'One-line summary', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
            { name: 'goodFor', label: 'Good for', type: 'stringList', help: 'Short points, one per line. Only list things that are true.' },
            {
              name: 'options',
              label: 'Lengths and prices',
              type: 'stringList',
              help: 'One per line, like: 60 minutes | RWF 30,000. The price is optional. Each line gets its own Book button. Leave empty if you prefer to quote on request.',
              placeholder: '60 minutes | RWF 30,000',
            },
            { name: 'image', label: 'Photo (optional)', type: 'image', help: 'Shown in an arch next to the treatment. Portrait photos work best.' },
            { name: 'imageAlt', label: 'Photo description', type: 'text' },
          ],
        },
      ],
    },
    galleryGroup(40),
    {
      name: 'guide',
      label: 'Help me choose',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'text' },
        {
          name: 'items',
          label: 'Guide rows',
          type: 'list',
          itemNoun: 'row',
          titleField: 'title',
          max: 6,
          fields: [
            { name: 'title', label: 'If the visitor says…', type: 'text' },
            { name: 'text', label: 'Suggest…', type: 'text' },
          ],
        },
      ],
    },
    ctaGroup,
  ],
};

export const CONTACT_DEF: DocDef = {
  key: 'contact',
  title: 'Contact page',
  description: 'How people reach you, plus a booking request form that opens WhatsApp.',
  viewPath: '/contact',
  fields: [
    seoGroup('Contact page'),
    {
      name: 'intro',
      label: 'Page introduction',
      type: 'group',
      fields: [
        { name: 'eyebrow', label: 'Small heading', type: 'text' },
        { name: 'headline', label: 'Headline', type: 'text' },
        { name: 'text', label: 'Introduction', type: 'textarea', rows: 3 },
        { name: 'image', label: 'Background photo (optional)', type: 'image' },
        { name: 'imageAlt', label: 'Photo description', type: 'text' },
      ],
    },
    {
      name: 'details',
      label: 'Contact details panel',
      type: 'group',
      fields: [
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'text', help: 'Your phone, WhatsApp, email and hours come from Site settings, Contact details.' },
      ],
    },
    {
      name: 'form',
      label: 'Booking request form',
      type: 'group',
      fields: [
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 2 },
        { name: 'buttonLabel', label: 'Button label', type: 'text' },
        { name: 'notePlaceholder', label: 'Hint in the notes box', type: 'text' },
      ],
    },
    {
      name: 'areas',
      label: 'Areas',
      type: 'group',
      fields: [
        visible,
        { name: 'title', label: 'Heading', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea', rows: 3, help: 'The towns and areas listed in Site settings appear below this text.' },
      ],
    },
    ctaGroup,
  ],
};

export const SITE_DEF: DocDef = {
  key: 'site',
  title: 'Site settings',
  description: 'Contact details, menu and footer shared by every page.',
  viewPath: '/',
  fields: [
    {
      name: 'brand',
      label: 'Brand',
      type: 'group',
      fields: [
        { name: 'name', label: 'Business name', type: 'text', help: 'Shown in the logo, e.g. "Mobile Massage".' },
        { name: 'descriptor', label: 'Line under the name', type: 'text', help: 'e.g. "Home Service · Kigali".' },
        { name: 'tagline', label: 'Tagline', type: 'text' },
      ],
    },
    {
      name: 'seo',
      label: 'Search and social',
      type: 'group',
      fields: [
        {
          name: 'siteUrl',
          label: 'Website address',
          type: 'url',
          placeholder: 'https://www.yourdomain.com',
          help: 'Your real domain, with https. Used for the sitemap, canonical links and share previews.',
        },
        { name: 'shareImage', label: 'Default share image', type: 'image', help: 'Used on pages that have no share image of their own.' },
        {
          name: 'areaServed',
          label: 'Towns and areas you serve',
          type: 'stringList',
          help: 'One per line, e.g. your city and nearby districts. Helps Google show you for local searches.',
        },
        {
          name: 'social',
          label: 'Social profile links',
          type: 'stringList',
          help: 'Full links, e.g. your Instagram, Facebook or TikTok page.',
        },
        {
          name: 'googleVerification',
          label: 'Google Search Console code',
          type: 'text',
          help: 'Paste only the code from the "HTML tag" verification option, not the whole tag.',
        },
      ],
    },
    {
      name: 'nav',
      label: 'Menu',
      type: 'group',
      fields: [linkList('items', 'Menu links', 'menu link')],
    },
    {
      name: 'cta',
      label: 'Header button',
      type: 'group',
      fields: [{ name: 'label', label: 'Label', type: 'text', help: 'This button opens WhatsApp.' }],
    },
    {
      name: 'contact',
      label: 'Contact details',
      type: 'group',
      fields: [
        { name: 'phone', label: 'Phone number (as shown)', type: 'text', help: 'Displayed on the site, e.g. 0796907746.' },
        {
          name: 'whatsapp',
          label: 'WhatsApp number (international format)',
          type: 'text',
          placeholder: '250796907746',
          help: 'Country code first, digits only. All "Book on WhatsApp" buttons use this.',
        },
        { name: 'email', label: 'Email', type: 'text', help: 'Leave empty to hide.' },
        { name: 'hours', label: 'Opening hours', type: 'text', help: 'Leave empty to hide.' },
        { name: 'serviceArea', label: 'Where I come', type: 'text' },
      ],
    },
    {
      name: 'footer',
      label: 'Footer',
      type: 'group',
      fields: [
        { name: 'blurb', label: 'Short description', type: 'textarea', rows: 3 },
        {
          name: 'groups',
          label: 'Link columns',
          type: 'list',
          itemNoun: 'column',
          titleField: 'title',
          max: 4,
          fields: [
            { name: 'title', label: 'Column title', type: 'text' },
            linkList('links', 'Links'),
          ],
        },
        { name: 'legal', label: 'Legal line', type: 'text', help: 'Shown after the copyright year.' },
      ],
    },
  ],
};

export const DOCS = { home: HOME_DEF, about: ABOUT_DEF, collection: COLLECTION_DEF, contact: CONTACT_DEF, site: SITE_DEF } as const;
export type DocKey = keyof typeof DOCS;

export const DEFAULTS: Record<DocKey, unknown> = {
  home: HOME_DEFAULTS,
  about: ABOUT_DEFAULTS,
  collection: COLLECTION_DEFAULTS,
  contact: CONTACT_DEFAULTS,
  site: SITE_DEFAULTS,
};

export function isDocKey(k: string): k is DocKey {
  return Object.prototype.hasOwnProperty.call(DOCS, k);
}
