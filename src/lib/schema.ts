import { site } from '../data/site';

/** Stable @id for the studio, so other nodes can reference it rather than repeat it. */
export const organizationId = (origin: string): string => `${origin}/#organization`;

export function organizationSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': organizationId(origin),
    name: site.name,
    url: origin,
    email: site.email,
    description: site.tagline,
    founder: {
      '@type': 'Person',
      name: 'Max Chechel',
      sameAs: [site.linkedinUrl],
    },
    sameAs: [site.contraUrl, site.linkedinUrl],
    areaServed: 'Worldwide',
    knowsAbout: [
      'Webflow development',
      'Design systems',
      'Marketing websites',
      'Web performance',
      'Technical SEO',
    ],
  };
}

export function websiteSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: site.name,
    publisher: { '@id': organizationId(origin) },
  };
}

interface CaseStudySchemaInput {
  origin: string;
  url: string;
  title: string;
  description: string;
  client: string;
  year: string;
  services: readonly string[];
  image: string;
}

export function caseStudySchema(input: CaseStudySchemaInput) {
  const { origin, url, title, description, client, year, services, image } = input;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#case-study`,
    url,
    name: `${title} — ${client}`,
    headline: title,
    description,
    image,
    // "2024-2025" is a range in the export; take the first year for dateCreated.
    dateCreated: year.split('-')[0],
    creator: { '@id': organizationId(origin) },
    about: { '@type': 'Organization', name: client },
    keywords: services.join(', '),
    inLanguage: 'en',
  };
}
