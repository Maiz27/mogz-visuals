export const getHeroImages = `*[_type == "heroImages"]{
  "images": images[].asset->url,
}[0]`;

export const getServices = `*[_type == "services"]{
  title,
  "images": images[].asset->url,
}| order(title asc)`;

export const getServiceNames = `*[_type == "services"]{
  title,
}| order(title asc)`;

export const getCollectionBySlug = `*[_type == "collection" && slug.current == $slug]{
  title,
  slug,
  "mainImage": mainImage.asset->url,
  service,
  date,
  "gallery": gallery[].asset->url,
}[0]`;
