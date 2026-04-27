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

  return (
    <>
      <ul ref={refsView} className="hidden"></ul>
      <div className="relative w-full max-w-4xl">
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

        {images.length > 1 ? (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-6">
            <button
              onClick={previousImage}
              className="bg-inherit rounded-full shadow-lg px-28 py-2 ml-2 text-white font-medium hover:bg-white hover:text-blue-500 transition duration-300 ease-in-out focus:outline-none">
              &#8249;
            </button>

            <button
              onClick={nextImage}
              className="bg-inherit rounded-full shadow-lg px-28 py-2 ml-2 text-white font-medium hover:bg-white hover:text-blue-500 transition duration-300 ease-in-out focus:outline-none">
              &#8250;
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Carousel;
