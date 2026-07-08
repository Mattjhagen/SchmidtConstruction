// Editable homepage section content — defaults shown here, overrides stored in Supabase site_config

export const defaultSections = {
  hero: {
    headline: 'Building Durable Structures with Quality and Precision',
    subheadline: 'Family-owned general contractor serving Omaha, Nebraska and surrounding areas since 1976. Specializing in retaining walls, concrete, drainage, and remodeling.',
    ctaText: 'Get a Free Quote',
  },
  about: {
    title: 'Why Omaha Chooses Schmidt Construction',
    body: 'Since 1976, we\'ve built a reputation for doing the job right the first time. As a family-owned business, our name is on every wall we build and every project we complete. We show up on time, price jobs honestly, and stand behind our work.',
    bullets: [
      '50+ years serving the Omaha metro',
      'Every project includes proper drainage',
      'Licensed, bonded, and fully insured',
      'Free on-site estimates',
      'Straight answers and transparent pricing',
    ],
  },
  services: {
    title: 'Our Services',
    subtitle: 'From retaining walls and concrete to kitchen and bathroom remodeling, Schmidt Construction delivers quality craftsmanship on every project.',
  },
  projects: {
    title: 'Recent Projects',
    subtitle: 'A sample of our work across Omaha and surrounding communities.',
  },
  testimonials: {
    title: 'What Our Customers Say',
    subtitle: 'Hundreds of happy homeowners and businesses across the Omaha metro.',
  },
  hours: {
    weekdays: '8:00 AM – 5:00 PM',
    saturday: '9:00 AM – 2:00 PM',
    sunday: 'Closed',
  },
};

export type SectionKey = keyof typeof defaultSections;
