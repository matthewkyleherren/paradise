export const aboutQueries = {
  all: `
    *[_type == "about"][0] {
      description,
      stack,
      clients,
      social[]{
        name,
        url
      },
      achievements[]{
        award,
        result
      },
      email,
      phone,
      video,
      bgImage,
      "hasBgImage": defined(bgImage.asset->_id)
    }
  `,
};