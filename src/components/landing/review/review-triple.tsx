"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { SectionLayout } from "@/components/landing/section-layout";

const reviews = [
  {
    image: "https://i.pravatar.cc/300?u=a3",
    name: "Paul",
    review: `J'ai apprécié la possibilité de **prendre rendez-vous en ligne et de recevoir des rappels automatiques** pour les vaccins de mon chat.`,
    role: "Propriétaire d'animaux",
    location: "Namur, Belgique",
  },
  {
    image: "https://i.pravatar.cc/300?u=a6",
    name: "Dr. Martin",
    review: `La plateforme est intuitive et **me fait gagner un temps précieux dans la gestion des rendez-vous**. Mes clients apprécient aussi.`,
    role: "Vétérinaire",
    location: "Bruxelles, Belgique",
  },
  {
    image: "https://i.pravatar.cc/300?u=a4",
    name: "Sophie",
    review: `Le service client est très réactif et **j'ai trouvé un vétérinaire près de chez moi en quelques minutes**. Très pratique !`,
    role: "Propriétaire d'animaux",
    location: "Liège, Belgique",
  },
  {
    image: "https://i.pravatar.cc/300?u=a5",
    name: "Dr. Dupont",
    review: `Grâce à VetAnytime, **j'ai élargi ma patientèle et simplifié la gestion de mon agenda**. Je recommande à mes confrères.`,
    role: "Vétérinaire",
    location: "Mons, Belgique",
  },
];

export const ReviewItem = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  // Auto-swipe functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentReview = reviews[currentIndex];

  // Parse review text with bold formatting
  const parseReviewText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-gray-900 ">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative mx-auto flex max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-8 ">
      {/* Client Badge */}
      <div className="mb-6 flex justify-center">
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
          <div className="h-6 w-6 overflow-hidden rounded-full">
            <Image
              src={currentReview.image || "/placeholder.svg"}
              alt={currentReview.name}
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
          {currentReview.name}, {currentReview.location}
        </div>
      </div>

      {/* Review Content with Animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isTransitioning
            ? "translate-y-4 transform opacity-0"
            : "translate-y-0 transform opacity-100"
        }`}
      >
        <div className="mb-8 text-center">
          <p className="mb-4 text-lg leading-relaxed text-gray-700">
            {parseReviewText(currentReview.review)}
          </p>
          <p className="text-sm font-medium text-gray-500">
            {currentReview.role}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous review"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-gray-300 transition-all duration-200 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next review"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 300);
              }
            }}
            className={`h-2 w-2 cursor-pointer rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "w-6 bg-teal-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const ReviewTriple = () => {
  return (
    <SectionLayout variant="card">
      <p className="mb-8 max-w-xl text-center text-3xl tracking-tight sm:text-5xl">
        Ce que nos clients disent
      </p>
      <div className="flex gap-4">
        <ReviewItem />
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-4">
          <Image
            src="https://images.pexels.com/photos/5214997/pexels-photo-5214997.jpeg"
            alt="Team collaboration"
            width={500}
            height={500}
            className="bg-muted size-[220px] rounded-t-[83px] object-cover transition-all duration-300 hover:rounded-[83px] hover:rounded-br-[12px]"
          />
          <Image
            src="https://images.pexels.com/photos/32577416/pexels-photo-32577416.jpeg"
            alt="Social media content"
            width={500}
            height={500}
            className="bg-muted size-[220px] rounded-r-[83px] object-cover transition-all duration-300 hover:rounded-[83px] hover:rounded-bl-[12px]"
          />
          <Image
            src="https://images.pexels.com/photos/32560348/pexels-photo-32560348.jpeg"
            alt="Digital marketing"
            width={500}
            height={500}
            className="bg-muted size-[220px] rounded-l-[83px] object-cover transition-all duration-300 hover:rounded-[83px] hover:rounded-tr-[12px]"
          />
          <Image
            src="https://images.pexels.com/photos/32611127/pexels-photo-32611127.jpeg"
            alt="Analytics dashboard"
            width={500}
            height={500}
            className="bg-muted size-[220px] rounded-b-[83px] object-cover transition-all duration-300 hover:rounded-[83px] hover:rounded-tl-[12px]"
          />
        </div>
      </div>
    </SectionLayout>
  );
};
