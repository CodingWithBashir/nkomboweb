import Image, { type ImageProps } from 'next/image';

/**
 * A portrait that can never crash a page.
 *
 * Photos are pasted or uploaded by the school office, so the URL may point at
 * any image host. `next/image` throws for a host that is not listed in
 * `next.config.js`, which used to take the whole teachers page down. Here the
 * optimiser is used only for hosts we know about (and for local files);
 * anything else falls back to a plain lazy `<img>` with the same styling.
 */
const OPTIMISED_HOSTS = [
  'i.ibb.co',
  'ibb.co',
  's1.ibb.co',
  'images.unsplash.com',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'ui-avatars.com',
  'images.pexels.com',
];

function hostOf(src: string): string | null {
  try {
    return new URL(src).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function canOptimise(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return true; // local file in /public
  const host = hostOf(src);
  if (!host) return false;
  return OPTIMISED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

export default function SafeImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  if (src && canOptimise(src)) return <Image {...props} />;

  // Unknown host — render it directly so the page keeps working.
  const { alt, width, height, className, sizes, priority, fill } = props as ImageProps & {
    fill?: boolean;
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : typeof width === 'number' ? width : undefined}
      height={fill ? undefined : typeof height === 'number' ? height : undefined}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
