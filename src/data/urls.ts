export function urlToFilePath(url: string | null): string | null {
  if (url && !url.startsWith("#") && !url.match(/^\w+:.*/)) {
    const parts = url.match(/^([^?#]+)(.*)$/);
    if (parts && parts[1]) {
      return parts[1];
    }
  }
  return null;
}
