import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Organization } from "@prisma/client";

export interface VeterinarianCardProps {
  veterinarian: Organization;
}

export const VeterinarianCard = (props: VeterinarianCardProps) => {
  return (
    <Link
      href={`/veterinarian/${props.veterinarian.slug}`}
      className="group relative h-[321px] w-[314px] overflow-hidden rounded-lg"
    >
      <Image
        src={props.veterinarian.logo ?? "/placeholder.png"}
        alt={props.veterinarian.name}
        width={450}
        height={450}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
      />
      <div className="absolute bottom-2 left-2 flex w-[calc(100%-1rem)] rounded-md bg-white/60 px-3 py-2 backdrop-blur-lg">
        <div className="">
          <p className="font-semibold">{props.veterinarian.name}</p>
          <span className="flex items-center gap-1.5">
            <BriefcaseBusiness size={16} />{" "}
            <p className="text-xs">
              {props.veterinarian.experiences} années d'experiences
            </p>
          </span>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-105 group-hover:rotate-12 ">
        <ArrowUpRight />
      </div>
    </Link>
  );
};
