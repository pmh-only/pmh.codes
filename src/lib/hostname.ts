export function hostnameParts(url: string) {
  const hostname = new URL(url).hostname;
  return hostname.endsWith('.pmh.codes')
    ? { prefix: hostname.slice(0, -'.pmh.codes'.length), suffix: '.pmh.codes' }
    : { prefix: hostname, suffix: '' };
}
