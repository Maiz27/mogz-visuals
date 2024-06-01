export const getHeroImages = `*[_type == "heroImages"]{
  "images": images[].asset->url,
}[0]`;

export const getFooterImages = `*[_type == "heroImages"]{
  "images": footer[].asset->url,
}[0]`;

export const getServices = `*[_type == "services"]{
  title,
  "images": images[].asset->url,
}| order(title asc)`;

export const getServiceNames = `*[_type == "services"]{
  title,
}| order(title asc)`;

export const getCollectionCredentials = `*[_type == "collection" && slug.current == $id && isPrivate == true]{
  slug,
  isPrivate,
  password,
}[0]`;

export const getCollectionBySlug = `*[_type == "collection" && slug.current == $slug]{
  isPrivate,
  title,
  slug,
  "mainImage": mainImage.asset->url,
  service,
  date,
  "gallery": gallery[].asset->url,
}[0]`;

export const getCollectionsByName = `*[_type == "collection" && title match $name && (isPrivate == false || isPrivate == null)]{
  isPrivate,
  title,
  slug,
  date,
  "mainImage": mainImage.asset->url,
}`;

export const getCollectionForSEO = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{
  slug, 
  title,
  "mainImage": mainImage.asset->url,
}[0]`;

export const getAllCollectionsForSitemap = `*[_type == "collection" && (isPrivate == false || isPrivate == null)]{
  slug, 
  date
}`;

export const getCollectionsCount = `count(*[_type == "collection" && (isPrivate == false || isPrivate == null)])`;
