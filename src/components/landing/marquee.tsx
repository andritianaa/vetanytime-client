import { Marquee } from "@/components/magicui/marquee";
import { PawnIcon } from "@/components/svg/pawn-icon";

const careTypes = [
  "Addoption",
  "Castration",
  "Vaccination",
  "Vermifugation",
  "Stérilisation",
  "Consultation",
  "Urgence",
  "Soins dentaires",
  "Analyse de sang",
  "Radiographie",
  "Échographie",
  "Chirurgie orthopédique",
  "Chirurgie générale",
  "Dermatologie",
  "Comportement animalier",
  "Nutrition animale",
  "Pharmacie vétérinaire",
  "Pension pour animaux",
];

const row = careTypes.slice(0, careTypes.length / 2);

const Card = ({ name }: { name: string }) => {
  return (
    <div className="mr-8 flex w-fit items-center justify-center">
      <p className="mr-2 text-2xl text-white">{name}</p>
      <PawnIcon />
    </div>
  );
};

export function MarqueeLanding() {
  return (
    <div className="bg-primary relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:30s]">
        {row.map((careType) => (
          <Card key={careType} name={careType} />
        ))}
      </Marquee>
    </div>
  );
}
