import React from "react";
import { Card } from "../components/ui/card";
import { MapPin, Car, Train, Clock, Navigation, Users, Camera, AlertTriangle } from "lucide-react";

const DetailsPage = () => {
  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-amber-900 mb-4">
            Détails de la journée
          </h1>
          <p className="text-xl font-serif text-stone-600">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-8">
          {/* Programme détaillé */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-amber-600 mr-3" />
              <h2 className="text-2xl font-serif text-amber-900">Programme de la journée</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                Notre mariage commencera à <strong>11h</strong> à la mairie de Saint Cyr l'école, 
                puis vous êtes attendus au Château De Neuville à partir de <strong>17h</strong>.
              </p>
            </div>
          </Card>

          {/* Section transport */}
          <div className="space-y-6">
            <h2 className="text-3xl font-serif text-amber-900 text-center mb-6">
              Voici tout ce que vous devez savoir pour vous y rendre
            </h2>

            {/* Infos pratiques supplémentaires */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-lg">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                    <Users className="h-5 w-5 text-amber-700" />
                  </div>
                  <p className="text-stone-700">
                    <span className="font-medium">Enfants bienvenus.</span> Une kids zone sera prévue sur place avec une baby-sitter pour la garde et l'animation. Une pièce calme à l'étage permettra aux enfants de se reposer ou de dormir (s'ils y arrivent!).
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-rose-700" />
                  </div>
                  <p className="text-stone-700">
                    <span className="font-medium">Allergies et régimes particuliers.</span> Lors de votre confirmation, merci de nous signaler toute allergie ou restriction alimentaire afin que nous puissions adapter le menu du dîner.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Camera className="h-5 w-5 text-green-700" />
                  </div>
                  <p className="text-stone-700">
                    <span className="font-medium">Photos.</span> Immortalisons ces instants magiques ! N'hésitez pas à prendre vos clichés ; nous partagerons également les photos officielles avec vous après l'événement.
                  </p>
                </li>
              </ul>
            </Card>

            {/* En voiture */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <Car className="h-6 w-6 text-amber-600 mr-3" />
                <h3 className="text-2xl font-serif text-amber-900">En voiture</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-serif text-lg text-stone-800 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 text-amber-600 mr-2" />
                    Mairie
                  </h4>
                  <p className="text-stone-700">
                    Tapez <strong>"Mairie de Saint Cyr l'école"</strong> sur Waze ou Google Maps
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-lg text-stone-800 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 text-amber-600 mr-2" />
                    Château
                  </h4>
                  <p className="text-stone-700 mb-2">
                    Tapez <strong>"Château De Neuville"</strong> ou
                  </p>
                  <p className="text-stone-700 font-medium">
                    <strong>"22 Rue de Laverdy 78950 Gambais"</strong>
                  </p>
                  <p className="text-amber-700 text-sm mt-2 font-medium">
                    ✓ Parking disponible au château
                  </p>
                </div>
              </div>
            </Card>

            {/* En train */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <Train className="h-6 w-6 text-amber-600 mr-3" />
                <h3 className="text-2xl font-serif text-amber-900">En train</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-serif text-lg text-stone-800 mb-3 flex items-center">
                    <Navigation className="h-4 w-4 text-amber-600 mr-2" />
                    Pour la Mairie
                  </h4>
                  <p className="text-stone-700">
                    <strong>Gare de Saint Cyr l'école</strong>
                    <br />
                    <span className="text-sm text-stone-600">(5 minutes à pied)</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-lg text-stone-800 mb-3 flex items-center">
                    <Navigation className="h-4 w-4 text-amber-600 mr-2" />
                    Pour le Château
                  </h4>
                  <p className="text-stone-700 mb-2">
                    <strong>Gare de Houdan</strong> (ligne N)
                  </p>
                  <p className="text-amber-700 text-sm font-medium">
                    ✓ Une voiture vous attendra à la gare
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;