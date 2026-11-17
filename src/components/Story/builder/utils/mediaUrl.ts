/**
 * Media URL Resolver for Bot Bán Hàng Story System
 */

const SAFE_DATA_IMAGE_RE =
  /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon)(?:;|,)/i;

export function resolveMediaUrl(localPath: string | undefined | null): string {
  if (!localPath || typeof localPath !== 'string') return '';
  const trimmed = localPath.trim();
  if (!trimmed) return '';

  const normalized = trimmed.replace(/[\u0000-\u0020\u007f]+/g, '').toLowerCase();

  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('file:') ||
    trimmed.startsWith('//')
  ) {
    return '';
  }

  if (normalized.startsWith('data:')) {
    return SAFE_DATA_IMAGE_RE.test(trimmed) ? trimmed : '';
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    if (
      trimmed.startsWith('https://') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }
    return '';
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}

export function resolveStoryMediaUrls<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => resolveStoryMediaUrls(item)) as T;
  }

  const result = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    const value = result[key];

    if (key === 'content' && typeof value === 'string') {
      const parentType = (obj as Record<string, unknown>).type;
      if (['image', 'video', 'audio', 'gif', 'sticker'].includes(parentType as string)) {
        result[key] = resolveMediaUrl(value);
      }
    } else if (key === 'value' && typeof value === 'string') {
      const parentType = (obj as Record<string, unknown>).type;
      if (['image', 'video'].includes(parentType as string)) {
        result[key] = resolveMediaUrl(value);
      }
    } else if (key === 'src' && typeof value === 'string') {
      result[key] = resolveMediaUrl(value);
    } else if (key === 'thumbnail' && typeof value === 'string') {
      result[key] = resolveMediaUrl(value);
    } else if (key === 'images' && Array.isArray(value)) {
      result[key] = value.map(img => {
        if (typeof img === 'string') {
          return resolveMediaUrl(img);
        } else if (img && typeof img === 'object' && 'src' in img) {
          return { ...img, src: resolveMediaUrl((img as { src: string }).src) };
        }
        return img;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveStoryMediaUrls(value);
    }
  }

  return result as T;
}

export function isLocalAssetPath(url: string): boolean {
  if (!url) return false;
  return (
    url.startsWith('/uploads/') ||
    SAFE_DATA_IMAGE_RE.test(url) ||
    url.startsWith('blob:')
  );
}

export function getEnvironmentMode(): 'development' | 'production' {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}
