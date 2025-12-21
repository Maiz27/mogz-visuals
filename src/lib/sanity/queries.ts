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

export const getCollectionCredentials = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  uniqueId,
  isPrivate,
  password,
}[0]`;

export const getCollectionBySlug = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{
  isPrivate,
  uniqueId,
  title,
  slug,
  "mainImage": mainImage.asset->url,
  service,
  date,
  "gallery": gallery[].asset->url,
}[0]`;

export const getPrivateCollectionByID = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  isPrivate,
  title,
  uniqueId,
  "mainImage": mainImage.asset->url,
  service,
  date,
  password,
  "imageCount": count(gallery),
}[0]`;

export const getPrivateCollectionGallery = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  "gallery": gallery[].asset->url,
}[0].gallery[]`;

export const getCollectionsByName = `*[_type == "collection" && title match $name && (isPrivate == false || isPrivate == null)]{
  isPrivate,
  title,
  slug,
  date,
  "mainImage": mainImage.asset->url,
}`;

export const getPublicCollectionImageCount = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{"count": count(gallery)}[0].count`;

export const getPublicCollectionGallerySegment = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{
  "gallery": gallery[$start...$end].asset->url
}[0].gallery`;

export const getPrivateCollectionImageCount = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{"count": count(gallery)}[0].count`;

export const getPrivateCollectionGallerySegment = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  "gallery": gallery[$start...$end].asset->url
}[0].gallery`;

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

export const getPublicCollectionWithInitialImages = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{
  isPrivate,
  uniqueId,
  title,
  slug,
  "mainImage": mainImage.asset->url,
  service,
  date,
  "imageCount": count(gallery),
  "gallery": gallery[0...20].asset->url,
}[0]`;

export const getPrivateCollectionWithInitialImages = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  isPrivate,
  title,
  uniqueId,
  "mainImage": mainImage.asset->url,
  service,
  date,
  password,
  "imageCount": count(gallery),
  "gallery": gallery[0...20].asset->url,
}[0]`;

export const getPrivateCollectionInitialGallery = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  "imageCount": count(gallery),
  "gallery": gallery[0...20].asset->url,
}[0]`;

export const getDownloadGalleryBySlug = `*[_type == "collection" && slug.current == $slug && (isPrivate == false || isPrivate == null)]{
  "gallery": gallery[].asset->{
    "url": url,
    "size": size
  },
  title
}[0]`;

export const getDownloadGalleryById = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  "gallery": gallery[].asset->{
    "url": url,
    "size": size
  },
  title // Assuming title is needed for zip name
}[0]`;
