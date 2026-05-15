interface StickerImageProps {
  imageUrl?: string | null;
  emoji?: string | null;
  alt: string;
  /** Classe do container que dimensiona a figurinha. */
  className?: string;
  /** Classe aplicada ao emoji quando não há imagem real. */
  emojiClassName?: string;
}

/**
 * Exibe a imagem real da figurinha quando disponível; caso contrário, mostra
 * o emoji de fallback. Centraliza essa decisão para todos os cards.
 */
export default function StickerImage({
  imageUrl,
  emoji,
  alt,
  className = '',
  emojiClassName = 'text-5xl',
}: StickerImageProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        className={`object-cover w-full h-full ${className}`}
      />
    );
  }

  return <span className={emojiClassName}>{emoji ?? '🃏'}</span>;
}
