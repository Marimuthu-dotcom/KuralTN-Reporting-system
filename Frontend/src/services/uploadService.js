// Frontend/src/services/uploadService.js
export const uploadService = {
  getPublicImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path;
  },
};
