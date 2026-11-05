import Image from "next/image";

// Cover image, or the accent gradient when a post has no cover yet.
export function CoverImage({
  url,
  alt,
  sizes,
  className = "",
}: {
  url: string | null;
  alt: string;
  sizes: string;
  className?: string;
}) {
  if (!url) {
    return <div className={`bg-gradient-to-br from-accent to-accent-2 ${className}`} />;
  }
  return (
    <div className={`relative overflow-hidden bg-card ${className}`}>
      <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
