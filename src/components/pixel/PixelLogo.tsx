
export default function PixelLogo({ text }: { text: string }) {
    return (
      <h1 className="font-pixel text-5xl sm:text-6xl md:text-7xl tracking-wider">
        {text.split("").map((char, i) => (
          <span key={i} className="pixel-letter">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    );
  }
  