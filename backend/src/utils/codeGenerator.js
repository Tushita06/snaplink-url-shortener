/**
 * Generates a random alphanumeric short code
 * @param {number} length Length of code to generate (default 6)
 * @returns {string} Unique code
 */
const generateShortCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Validates if a string is a valid URL
 * @param {string} string URL to validate
 * @returns {boolean} True if valid
 */
const isValidUrl = (string) => {
  try {
    // Prepends protocol if missing just for validation, but regex is safer
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return !!pattern.test(string);
  } catch (e) {
    return false;
  }
};

/**
 * Extracts a clean display title from a URL
 * e.g., https://news.ycombinator.com/item?id=123 -> HN | news.ycombinator.com
 * @param {string} urlString Destination URL
 * @returns {string} Display title
 */
const extractTitleFromUrl = (urlString) => {
  try {
    // Remove protocol
    let domain = urlString.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Split by slash to get host
    domain = domain.split('/')[0];
    
    // Capitalize host name parts
    const parts = domain.split('.');
    if (parts.length >= 2) {
      const name = parts[parts.length - 2];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return domain;
  } catch (e) {
    return 'Web Address';
  }
};

module.exports = {
  generateShortCode,
  isValidUrl,
  extractTitleFromUrl
};
