"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const services = [
  {
    id: 1,
    title: "Prise de rendez-vous en ligne",
    image: "https://images.pexels.com/photos/6235115/pexels-photo-6235115.jpeg",
    tags: ["Réservation", "Calendrier"],
    description:
      "Prenez rendez-vous en ligne avec un vétérinaire gratuitement et simplement.",
  },
  {
    id: 2,
    title: "Chatbot animalier",
    image:
      "https://images.pexels.com/photos/30530422/pexels-photo-30530422.jpeg",
    tags: ["Questions", "Urgence"],
    description:
      "Obtenez des réponses instantanées à vos questions grâce à notre chatbot animalier.",
  },
  {
    id: 3,
    title: "Calendrier synchronisé",
    image: "https://images.pexels.com/photos/6473735/pexels-photo-6473735.jpeg",
    tags: ["Calendrier", "RDV"],
    description:
      "Vetanytime synchronisera automatiquement vos rendez-vous vétérinaires à vos agendas (Google Calendar, Microsoft Calendar, etc.).",
  },
  {
    id: 4,
    title: "Gestion du dossier médical",
    image: "https://images.pexels.com/photos/7578815/pexels-photo-7578815.jpeg",
    tags: ["Historique", "Vaccins"],
    description:
      "Gérez et consultez le dossier médical complet de vos animaux à tout moment.",
  },
  {
    id: 5,
    title: "Notifications & rappels",
    image:
      "https://images.pexels.com/photos/10981661/pexels-photo-10981661.jpeg",
    tags: ["Alertes", "Suivi"],
    description:
      "Recevez des notifications et rappels pour ne rien oublier concernant vos animaux.",
  },
];

export const Services = () => {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPause, setShowPlayPause] = useState(false);

  const STORY_DURATION = 4000; // 4 seconds per story

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStory((current) => (current + 1) % services.length);
          return 0;
        }
        return prev + 100 / (STORY_DURATION / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    setProgress(0);
  }, [currentStory]);

  const goToStory = (index: number) => {
    setCurrentStory(index);
    setProgress(0);
  };

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % services.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + services.length) % services.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowPlayPause(true);
  };

  useEffect(() => {
    if (showPlayPause) {
      const timer = setTimeout(() => {
        setShowPlayPause(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showPlayPause]);

  return (
    <div className="flex bg-[#d3d3d3] py-16 dark:bg-[#0e0e0e]">
      <div className="mx-auto w-full max-w-6xl p-6">
        <Card className="overflow-hidden rounded-xl border-none bg-white p-0 shadow-none dark:bg-black">
          <div className="flex min-h-[600px] flex-col p-8 lg:flex-row">
            {/* Stories Section - Left */}
            <div className="relative overflow-hidden rounded-lg bg-gray-100 lg:w-1/2">
              {/* Progress Indicators */}
              <div className="absolute top-4 right-4 left-4 z-20 flex gap-1">
                {services.map((_, index) => (
                  <div
                    key={index}
                    className="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/30"
                    onClick={() => goToStory(index)}
                  >
                    <div
                      className="h-full rounded-full bg-white transition-all duration-100 ease-linear"
                      style={{
                        width:
                          index === currentStory
                            ? `${progress}%`
                            : index < currentStory
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Image */}
              <div
                className="relative h-full min-h-[400px] w-full cursor-pointer bg-cover bg-center lg:min-h-[600px]"
                style={{
                  backgroundImage: `url(${services[currentStory].image})`,
                }}
                onClick={togglePlayPause}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Navigation Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-4 z-10 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevStory();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-4 z-10 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextStory();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Play/Pause Indicator */}
                {showPlayPause && (
                  <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-in fade-in-0 flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all duration-200 duration-300 hover:bg-black/60">
                      {!isPlaying ? (
                        <div className="flex gap-1">
                          <div className="h-6 w-1.5 rounded-full bg-white"></div>
                          <div className="h-6 w-1.5 rounded-full bg-white"></div>
                        </div>
                      ) : (
                        <div className="ml-1 h-0 w-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-white"></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Story Title */}
                <div className="absolute right-6 bottom-6 left-6">
                  <h3 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
                    {services[currentStory].title}
                  </h3>
                  <p className="text-sm text-white drop-shadow-md">
                    {services[currentStory].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Services List - Right */}
            <div className="pl-8 lg:w-1/2">
              <h2 className="mb-8 text-3xl font-bold">Nos services</h2>

              <div className="space-y-4">
                {services.map((service, index) => {
                  const isActive = index === currentStory;

                  return (
                    <div
                      key={service.id}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                        isActive
                          ? "border-primary/15 bg-primary/10 shadow-xl"
                          : "border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-[#0a0a0a]"
                      }`}
                      onClick={() => goToStory(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`h-16 w-16 overflow-hidden rounded-lg ${
                            isActive ? "ring-primary ring-2" : ""
                          }`}
                        >
                          <img
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3
                            className={`mb-2 text-lg font-semibold ${
                              isActive
                                ? "text-primary"
                                : "text-gray-900 dark:text-gray-50"
                            }`}
                          >
                            {service.title}
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            {service.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`text-xs ${
                                  isActive
                                    ? "border-primary/15 bg-primary/10 text-primary"
                                    : "bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-slate-100"
                                }`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
