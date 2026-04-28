import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

interface IProps {
  images: string[];
}

const Carousel: React.FC<IProps> = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div className="relative w-full aspect-[4/3] max-h-[500px]">
        <Image
          fill
          src={images[index]}
          className="object-contain"
          alt={`Image ${index + 1}`}
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-md transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-md transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-emerald-500" : "w-1.5 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
