/**
 * Finds the correct file path for a netlify url
 */
export const urlFile = (url: string) => {
  const replaced = url
    .split('/')
    .map(c => (c.startsWith(':') ? 'placeholder' : c))
    .filter(c => c !== '')
    .join('/')
  if (replaced === '') {
    return 'home'
  }
  return replaced
}
