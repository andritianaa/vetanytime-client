import { Bone, Cat, PawPrint, Store } from "lucide-react";

import { Pawn } from "@/components/svg/pawn";
import { cn } from "@/lib/utils";

import { SectionLayout } from "./section-layout";

type CareCardProps = {
  isPrimary?: boolean;
  title: string;
  description: string;
  icon: React.ElementType;
};

const cares: CareCardProps[] = [
  {
    isPrimary: false,
    title: "Soin exceptionnel pour votre animal",
    description:
      "Nous traitons vos amis à poils, à plumes ou à écailles comme des membres de la famille. Notre équipe dévouée veille à ce que chaque animal reçoive l'amour et l'attention qu'il mérite.",
    icon: Store,
  },
  {
    isPrimary: true,
    title: "Conseils d'experts",
    description:
      "Notre personnel compétent est là pour vous aider avec des astuces, des recommandations et des solutions adaptées aux besoins de votre animal.",
    icon: Cat,
  },
  {
    isPrimary: false,
    title: "Un environnement sûr",
    description:
      "La sécurité de votre animal est notre priorité. Nous maintenons un espace propre, sécurisé et accueillant pour tous les animaux.",
    icon: PawPrint,
  },
  {
    isPrimary: false,
    title: "Service axé sur la communauté",
    description:
      "En tant qu’amoureux des animaux, nous sommes passionnés par la création d’une communauté d’animaux et de propriétaires heureux.",
    icon: Bone,
  },
];

export function BentoGridSection() {
  return (
    <SectionLayout size="lg" variant="card">
      <div className="mb-16 flex">
        <p className="max-w-xl text-5xl">
          Assurer un soutien et des soins complets pour votre animal de
          compagnie
        </p>
      </div>
      <div className="relative grid grid-cols-4 gap-2">
        <Pawn
          variant="muted"
          className="absolute -top-[300px] -right-10 size-[400px]"
        />
        {cares.map((care, index) => (
          <CareCard
            key={index}
            isPrimary={care.isPrimary}
            title={care.title}
            description={care.description}
            icon={care.icon}
          />
        ))}
      </div>
    </SectionLayout>
  );
}

const CareCard = (props: CareCardProps) => {
  return (
    <div
      className={cn(
        "relative h-full rounded-2xl bg-white px-6 py-10 ",
        props.isPrimary && "bg-primary/10 border-primary border-2"
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center overflow-hidden rounded-full",
          props.isPrimary
            ? "bg-primary text-white"
            : " text-primary bg-[#f5f5f5]"
        )}
      >
        <props.icon />
      </div>
      <p className="text-lg">{props.title}</p>
      <p className="text-muted-foreground">{props.description}</p>
    </div>
  );
};
