export const labQueries = {
  all: `
    *[_type == "lab" && (
      (mediaType == "video" && defined(video.asset->_id)) ||
      (mediaType != "video" && defined(image.asset->_id))
    )] | order(_createdAt desc) {
      _id,
      title,
      mediaType,
      image,
      video,
      tech,
    }
  `,
};