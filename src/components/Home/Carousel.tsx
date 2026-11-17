import Image from "next/image";
import { useRef } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";

interface IProps {
  images: string[];
}

const Carousel: React.FC<IProps> = ({ images }) => {
  const refsView = useRef<any>(null);
  const refsImg = useRef<any>(null);

  const nextImage = () => {
    const liImage = refsImg.current.querySelectorAll("li").length;
    if (liImage === 1) {
      return;
    }
    refsView.current?.insertBefore(
      refsImg.current?.lastElementChild as any,
      null
    );
  };

  const previousImage = () => {
    const liView = refsView.current.querySelectorAll("li").length;

    if (liView === 0) {
      return;
    }
    refsImg.current?.insertBefore(
      refsView.current?.lastElementChild as any,
      null
    );
  };

  return (
    <VStack gap={2} className="relative w-full max-w-4xl">
      <ul ref={refsView} className="hidden"></ul>
      {images.length > 0 ? (
        <ul
          ref={refsImg}
          className="pt-3 relative h-96 rounded-xl overflow-hidden w-full">
          {images.map((img, i) => (
            <li key={i}>
              <Image
                layout="fill"
                objectFit="cover"
                src={img}
                className="w-full object-contain"
                alt="Pham Thanh Nam"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {images.length > 1 ? (
        <HStack gap={2} hAlign="center" className="absolute bottom-0 left-0 right-0 mb-6">
          <Button
            label="‹"
            variant="ghost"
            size="lg"
            onClick={previousImage}
          />
          <Button
            label="›"
            variant="ghost"
            size="lg"
            onClick={nextImage}
          />
        </HStack>
      ) : null}
    </VStack>
  );
};

export default Carousel;
