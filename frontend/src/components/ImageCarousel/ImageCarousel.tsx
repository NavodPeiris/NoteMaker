// components/ImageCarousel.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image1 from "@/assets/image1.png";
import Image2 from "@/assets/image2.png";
import Image3 from "@/assets/image3.png";

const images = [
  Image1,
  Image2,
  Image3,
];

export default function ImageCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-1/3 max-h-2/4 w-1/3 h-2/4 mt-4 overflow-hidden rounded-xl shadow-lg">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`Slide ${index}`}
          className="w-full h-full object-contain absolute top-0 left-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
    </div>
  );
}
