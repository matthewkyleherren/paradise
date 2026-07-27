export const postQueries = {
  all: `
    *[_type == "post"] | order(orderRank asc) {
      _id,
      title,
      "slug": slug.current,
      basicInfo,
      mainImage,
      "hasImage": defined(mainImage.asset->_id),
    }
  `,
  
  bySlug: `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      description,
      mainImage,
      "hasMainImage": defined(mainImage.asset->_id),
      basicInfo,
      "media": media[defined(asset->_id)],
      "next": *[_type == "post" && orderRank > ^.orderRank] | order(orderRank asc)[0] {
        title,
        "slug": slug.current
      },
      "prev": *[_type == "post" && orderRank < ^.orderRank] | order(orderRank desc)[0] {
        title,
        "slug": slug.current
      }
    }
  `,
};