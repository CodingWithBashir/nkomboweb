/**
 * The school's image host (imgbb / "imgdb").
 *
 * Photos are not stored on the school server: they are uploaded to imgbb and
 * only the resulting URL is kept in the database. The key can be overridden
 * with IMGBB_API_KEY, or changed at runtime in Dashboard → Settings.
 */
export const IMAGE_HOST_ENDPOINT = 'https://api.imgbb.com/1/upload';

export const IMAGE_HOST_KEY =
  process.env.IMGBB_API_KEY || 'd5627ba7e34e1c21d5efa513083c3a95';
