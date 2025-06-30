import { CircleSvg } from '@/components/svg/circle-svg';
import { VeterinarianCard } from '@/components/veterinarian/veterinarian-card';
import { prisma } from '@/prisma';

import { SectionLayout } from './section-layout';

export default async function TeamsSection() {
  const orgs = await prisma.organization.findMany({
    take: 6,
  });

  return (
    <SectionLayout
      size="lg"
      className="scroll-fade-up-repeat flex flex-col items-center justify-center gap-16 duration-1000"
    >
      <p className="mb-4 max-w-xl text-center text-3xl tracking-tight sm:text-5xl">
        Les meilleurs vétérinaires sont sur{" "}
        <span className="relative inline-block">
          <span>Vetanytime</span>
          <CircleSvg className="fill-primary absolute inset-0" />
        </span>
      </p>
      <div className="flex w-full flex-wrap justify-center gap-2">
        {orgs.map((org) => (
          <VeterinarianCard key={org.id} veterinarian={org} />
        ))}
      </div>
    </SectionLayout>
  );
}
