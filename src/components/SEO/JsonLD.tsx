import { BASEURL, ROUTES, SITE_NAME } from '@/lib/Constants';

const JsonLD = () => {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASEURL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASEURL}/gallery?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const navigationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ROUTES.map((route, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: route.name,
      url: `${BASEURL}${route.href}`,
    })),
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
      />
    </>
  );
};

export default JsonLD;
