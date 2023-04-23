import Image from "next/image";
import { FcNext } from "react-icons/fc";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { useRef } from "react";

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

  const arrowStyle =
    "absolute text-white text-2xl z-10 h-10 w-20 rounded-full opacity-75 flex items-center justify-center";

  const sliderControl = (isLeft: boolean) => (
    <button
      type="button"
      onClick={isLeft ? previousImage : nextImage}
      className={`${arrowStyle} ${isLeft ? "left-2" : "right-2"} inset-y-72`}>
      <span role="img" aria-label={`Arrow ${isLeft ? "left" : "right"}`}>
        {isLeft ? <MdOutlineArrowBackIosNew /> : <FcNext />}
      </span>
    </button>
  );
  return (
    <>
      <ul ref={refsView} className="hidden"></ul>
      {images.length > 1 ? sliderControl(true) : null}
      {images.length > 0 ? (
        <ul
          ref={refsImg}
          className="pt-3 relative h-96 rounded-lg overflow-hidden w-full">
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

      {images.length > 1 ? sliderControl(false) : null}
    </>
  );
};

export default Carousel;
