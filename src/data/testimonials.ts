import type { ClientSlug } from '../components/ClientLogo.astro';

/**
 * Client testimonials, verbatim from Contra.
 *
 * The export hardcoded these in three places (homepage grid, homepage featured
 * slot, three case studies). One list, referenced everywhere.
 */
export interface Testimonial {
  /** Quote text without surrounding quotation marks — the component adds them. */
  quote: string;
  author: string;
  company: string;
  logoSlug: ClientSlug;
  /** Matches a work item slug, so case studies can pull their own quote. */
  workSlug?: string;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Max has been a phenomenal asset to our team, working quickly and delivering quality and highly technical web designs with beautiful animations! Looking forward to continuing to work with Max in the future!',
    author: 'Michael McRoskey',
    company: 'FlutterFlow',
    logoSlug: 'flutterflow',
    workSlug: 'flutterflow',
    featured: true,
  },
  {
    quote:
      'Max built a beautiful, functional website for us, but even more important, he made suggestions for a better user experience, and the site build was so clean. Thanks, Max!',
    author: 'Michelle Gasparovic',
    company: 'Flight Science',
    logoSlug: 'flight-science',
    workSlug: 'flight-science',
  },
  {
    quote:
      'Max did a great job for us for two of the projects he was involved in. We would definitely consider working with him again in the future as the need arises.',
    author: 'Richard Nguyen',
    company: 'Sphere',
    logoSlug: 'sphere',
    workSlug: 'spherepay',
  },
  {
    quote:
      'Working with Max has been fantastic, I cannot recommend him enough. His proactiveness and attention to detail is top notch. Integrated seamlessly with our team on Slack and was always responsive.',
    author: 'Cam Wind',
    company: 'Platter',
    logoSlug: 'platter',
  },
  {
    quote:
      "Max has been an incredibly reliable Webflow developer, and we've built two sites already. He is flexible and fast, and asks the right questions when needed. He is also a thought partner and can suggest and recommend best practices.",
    author: 'Rebecca Brooker',
    company: 'Planthouse Studio',
    logoSlug: 'planthouse',
  },
  {
    quote:
      "Max was great to work with, always clearly communicating the changes he was making and the positive impact they had on our website. I would highly recommend him to anyone looking to improve their website's page speed.",
    author: 'Allan Cassinell',
    company: 'Blaze.ai',
    logoSlug: 'blaze',
  },
  {
    quote:
      "Max was an incredible partner to us in a short, urgent sprint to get our new website launched. He was a thought partner to our designers and efficient in executing against our plan. I can't recommend him enough!",
    author: 'Vilma Arceo',
    company: 'Euclid Power',
    logoSlug: 'euclid-power',
    workSlug: 'euclid-power',
  },
];

export const featuredTestimonial = testimonials.find((t) => t.featured)!;
export const gridTestimonials = testimonials.filter((t) => !t.featured);
