import { site } from './site';

/** Logos in the hero "Trusted by teams at:" strip. */
export const trustedBy = [
  { name: 'Replit', slug: 'replit' },
  { name: 'XBOW', slug: 'xbow' },
  { name: 'Lindy', slug: 'lindy' },
  { name: 'Sphere', slug: 'sphere' },
  { name: 'Alphapoint', slug: 'alphapoint' },
  { name: 'FlutterFlow', slug: 'flutterflow' },
] as const;

/** "Why teams hire Outredge" — four constants. */
export const features = [
  {
    title: 'Senior expertise',
    body: "Built sites for Replit, Lindy, XBOW, Sphere, and others. The person building your site is the person who's already shipped at the level you need.",
  },
  {
    title: 'Design engineered, not just built',
    body: 'Component architecture, design systems, GSAP, schema, custom JS. Webflow built the way real engineering teams ship software.',
  },
  {
    title: 'The first project is rarely the last',
    body: 'Most projects become ongoing work. Half of all retainer clients started as one-off projects. Built for the relationship, not the invoice.',
  },
  {
    title: 'Performance and SEO, built in',
    body: 'Core Web Vitals, schema markup, SEO-safe migrations. The technical SEO every modern site needs. Sites that load fast and rank.',
  },
] as const;

/** Three engagement models. `highlight` is the middle card the export emphasised. */
export const pricing = [
  {
    name: 'New site or rebrand',
    kind: 'Design + Build · Fixed price',
    body: 'For founders and marketing teams launching, redesigning, or migrating from another platform. You get the design system, not just the pages.',
    details: [
      'Typical scope: 5 to 25 pages, design system, full CMS, animation, SEO, migration.',
      'Timeline: 4 to 8 weeks.',
    ],
    price: 'From $5K fixed',
    href: site.bookingUrl,
    highlight: false,
  },
  {
    name: 'Build from Figma',
    kind: 'Build only · Fixed price',
    body: 'For teams with a finished Figma file who need a build that respects every design decision. Built in Webflow or in Astro/Next when the project calls for custom code.',
    details: ['Typical scope: full build, CMS architecture, animation, QA, launch.', 'Timeline: 2 to 6 weeks.'],
    price: 'From $2.5K fixed',
    href: site.bookingUrl,
    highlight: true,
  },
  {
    name: 'Webflow partner',
    kind: 'Ongoing · Monthly retainer',
    body: 'For marketing teams and scaling startups with continuous Webflow needs. New pages/sections, performance improvements, design system.',
    details: [
      'Typical scope: New pages, CMS additions, A/B tests, performance work, integrations.',
      'Cadence: Direct Slack access, weekly sprints.',
    ],
    price: 'From $2.5K/month',
    href: site.bookingUrl,
    highlight: false,
  },
] as const;

/** FAQ. `answer` is an array so multi-paragraph answers stay structured. */
export const faq = [
  {
    question: 'Do you only build in Webflow?',
    answer: [
      'No. Webflow is the right tool for most marketing sites and it is where most projects land, but the build follows the project. Sites that need a custom front end ship in Astro or Next. You are buying the system and the outcome, not a lock-in to one platform.',
    ],
  },
  {
    question: 'What is a design system, and do I need one?',
    answer: [
      'A design system is the reusable structure underneath a site: components, tokens, and rules that keep every page consistent and fast to build. If you are past a handful of pages, adding them often, or a team is touching the site, a system is what keeps it from drifting into a sprawl of one-offs. It is also the work AI tools handle worst.',
    ],
  },
  {
    question: 'Do you work with our existing designers or design team?',
    answer: [
      'About a half of projects come in as build-only from a finished Figma file. Your design decisions are respected and the build ships clean, no committee. If your designers want to stay involved during the build, reviewing interactions or signing off on edge cases, that is encouraged.',
    ],
  },
  {
    question: 'What happens after launch?',
    answer: [
      "Launch is the start, not the end. Some projects roll into a retainer for ongoing work: new pages, CMS additions, A/B tests, performance maintenance. If you don't need a retainer, you get full documentation, asset handoff, and 30 days of free fixes for anything that breaks. After that, support is hourly or you can switch to a retainer.",
    ],
  },
  {
    question: 'How does the retainer actually work?',
    answer: [
      'You get direct Slack access. Involvement level is agreed upfront and monthly hours are defined from that. Once the retainer is signed, work starts the next business day. The backlog can live in your internal system (Linear, Asana, Notion) or one gets set up for you.',
      'Small items usually ship the same day, larger items within one to two business days. For bigger pushes like launches or campaigns, hours flex up.',
    ],
  },
  {
    question: 'Who works on my project? Is Outredge a team?',
    answer: [
      'Outredge is a small studio, not an agency. Max leads every project directly: design direction, Webflow build, client relationship, end-to-end accountability. For projects with heavy design phases, a trusted design partner of several years is brought in. Everything still routes through Max, ships under one quality bar, and never gets handed to junior staff.',
      'This is the model that delivers senior-level work without the account managers, handoff layers, or overhead of a full agency.',
    ],
  },
] as const;
