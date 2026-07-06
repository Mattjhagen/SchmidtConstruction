export interface PortfolioItem {
  id: string;
  title: string;
  location: string;
  serviceSlug: string;
  serviceName: string;
  description: string;
  image: string;
  featured: boolean;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Terraced Block Wall System',
    location: 'Bellevue, NE',
    serviceSlug: 'block-retaining-wall',
    serviceName: 'Block Retaining Wall',
    description: 'Three-tier Allan Block retaining wall system on a steep residential slope. Includes drain tile and geogrid reinforcement on each level.',
    image: '/images/portfolio/terraced-block-wall.jpg',
    featured: true,
  },
  {
    id: 'p2',
    title: 'Backyard French Drain System',
    location: 'Papillion, NE',
    serviceSlug: 'drainage-solutions',
    serviceName: 'Drainage Solutions',
    description: 'French drain installed along the foundation perimeter with catch basin and 60-foot outlet pipe to street. Eliminated chronic basement moisture.',
    image: '/images/portfolio/french-drain.jpg',
    featured: true,
  },
  {
    id: 'p3',
    title: 'Decorative Stamped Concrete Patio',
    location: 'Omaha, NE',
    serviceSlug: 'concrete-contractor',
    serviceName: 'Concrete Work',
    description: '600 SF stamped concrete patio with integrated fire pit pad and step detail. Ashlar slate pattern with charcoal release.',
    image: '/images/portfolio/stamped-patio.jpg',
    featured: true,
  },
  {
    id: 'p4',
    title: 'Timber Terrace Retaining Walls',
    location: 'Gretna, NE',
    serviceSlug: 'timber-retaining-wall',
    serviceName: 'Timber Retaining Wall',
    description: 'Two-level pressure-treated timber terrace walls replacing deteriorated railroad tie walls. Includes garden bed integration.',
    image: '/images/portfolio/timber-terrace.jpg',
    featured: false,
  },
  {
    id: 'p5',
    title: 'Commercial Parking Lot Retaining Wall',
    location: 'La Vista, NE',
    serviceSlug: 'commercial-retaining-wall',
    serviceName: 'Commercial Retaining Wall',
    description: '120-foot Versa-Lok retaining wall to level a commercial parking lot expansion. Engineered to handle heavy load surcharge.',
    image: '/images/portfolio/commercial-parking.jpg',
    featured: false,
  },
  {
    id: 'p6',
    title: 'Driveway Replacement',
    location: 'Millard, NE',
    serviceSlug: 'concrete-contractor',
    serviceName: 'Concrete Work',
    description: 'Full driveway replacement with proper sub-base and 4-inch reinforced concrete. Includes apron, approach, and garage pad.',
    image: '/images/portfolio/driveway.jpg',
    featured: false,
  },
];

export const featuredPortfolio = portfolioItems.filter(p => p.featured);
