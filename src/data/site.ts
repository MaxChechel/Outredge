/** Site-wide constants. Every external destination lives here, not in markup. */
export const site = {
  name: 'Outredge',
  tagline: 'Marketing sites and design systems for B2B tech startups',
  email: 'max@outredge.com',
  /** Booking link used by every "Book a call" CTA. */
  bookingUrl: 'https://calendar.app.google/Gkhsnhx3KsdwENfY7',
  contraUrl: 'https://contra.com/maxchechel/reviews?r=maxchechel',
  linkedinUrl: 'https://www.linkedin.com/in/max-chechel-1174111b9/',
  /** Review count quoted in hero and testimonial copy. Update in one place. */
  reviewCount: 23,
} as const;

export const navLinks = [
  { href: '/work', label: 'Work' },
  { href: '/#approach', label: 'Approach' },
  { href: '/#pricing', label: 'How it works' },
] as const;

export const footerLinks = [
  ...navLinks,
  { href: '/contact', label: 'Contact' },
] as const;
