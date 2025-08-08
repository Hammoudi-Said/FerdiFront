import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowDown, Clock, MapPin, Music, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel";

const HERO_IMAGE = "/hero.jpg";

const HomePage = () => {
  const programDetails = [
    {
      time: "11h",
      event: "Mairie de St Cyr",
      icon: <MapPin className="h-5 w-5 text-amber-600" />,
    },
    {
      time: "17h",
      event: "Cocktail",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
    {
      time: "20h",
      event: "Dîner",
      icon: <Utensils className="h-5 w-5 text-amber-600" />,
    },
    {
      time: "22h30",
      event: "Soirée dansante",
      icon: <Music className="h-5 w-5 text-amber-600" />,
    },
  ];

  const scrollToProgram = () => {
    document.getElementById('program-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with provided image */}
      <section
        className="min-h-[80vh] sm:min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center relative"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* subtle overlay for readability */}
        {/* mobile-safe padding top to avoid notch overlap */}
        <div className="pt-12 sm:pt-0" />
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative max-w-4xl mx-auto">
          <div className="space-y-6 mb-8">
            <div className="tracking-[0.2em] uppercase text-stone-700 font-serif">Marhaba au mariage de</div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-calligraphic text-black leading-tight">
              Amel &amp; Tarek
            </h1>
            <div className="text-xl md:text-2xl font-serif text-stone-700">
              11 Octobre 2025
            </div>
          </div>
          <Button
            onClick={scrollToProgram}
            variant="outline"
            size="lg"
            className="bg-white/80 border-amber-300 text-amber-900 hover:bg-amber-50 font-serif text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowDown className="h-5 w-5 mr-2 animate-bounce" />
            Découvrir le programme
          </Button>
        </div>
      </section>

      {/* Program Section */}
      <section id="program-section" className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-serif text-amber-900 mb-2">Programme</h2>
            <p className="text-stone-600 font-serif">Samedi 11 Octobre 2025</p>
          </div>

          {/* Elegant list with icons and dashes */}
          <Card className="p-6 md:p-8 bg-white/70 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <ul className="space-y-4">
              {programDetails.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-stone-800">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="text-lg md:text-xl font-serif">
                    <span className="text-amber-800 font-medium">{item.time}</span>
                    <span className="mx-2">-</span>
                    <span>{item.event}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="text-center mt-10">
            <Link to="/details">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white font-serif text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Retrouvez tous les détails
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-16 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-serif text-amber-900 mb-4">
              Château De Neuville
            </h3>
            <p className="text-stone-600 font-serif text-lg">
              Un cadre d'exception pour notre union
            </p>
          </div>
          <ImageCarousel />
        </div>
      </section>
    </div>
  );
};

export default HomePage;