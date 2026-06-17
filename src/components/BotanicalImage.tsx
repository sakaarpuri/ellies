import Image from "next/image";

type BotanicalImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
};

export function BotanicalImage({
  src,
  alt,
  sizes = "(max-width: 720px) 100vw, 50vw",
  priority = false,
}: BotanicalImageProps) {
  return (
    <Image
      className="image-cover"
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      unoptimized
    />
  );
}
