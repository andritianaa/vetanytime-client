"use client";

import { animate } from 'motion/react';
import { clientef, useEffect } from 'react';

import { SectionLayout } from './section-layout';

interface StatProps {
  number: number;
  suffix: string;
  text: string;
}

const stats: StatProps[] = [
  {
    number: 2.54,
    suffix: "K",
    text: "Vétérinaires",
  },
  {
    number: 212.6,
    suffix: "K",
    text: "Utilisateurs satisfaits",
  },
  {
    number: 1.5,
    suffix: "M+",
    text: "Rendez-vous pris",
  },
];

export function StatsSection() {
  return (
    <SectionLayout
      size="base"
      className="scroll-fade-up-repeat flex gap-16 duration-1000"
    >
      <img
        className="h-[436px] w-[508px] rounded-tr-[90px] rounded-bl-[90px] transition-all duration-300 hover:rounded-none"
        src="/images/stat-media.jpg"
      />
      <div className="">
        <p className="mb-4 text-3xl tracking-tight sm:text-4xl">
          Là où vos animaux de compagnie sont au cœur de tout ce que nous
          faisons. Notre mission est de fournir des soins exceptionnels.
        </p>
        <p>
          Du toilettage au bien-être, nous couvrons tous les aspects des besoins
          de votre animal. Notre équipe reste à jour sur les dernières avancées
          en matière de soins pour offrir les meilleures solutions à vous et vos
          compagnons à quatre pattes.
        </p>
        <div className="mt-16 flex w-full items-center gap-12 md:max-w-none">
          {stats.map((stat, index) => (
            <div key={index} className="mp-4 relative">
              <h4 className="text-primary mb-2 text-2xl font-bold tabular-nums md:text-3xl">
                <Counter from={0} to={stat.number} />

                {stat.suffix}
              </h4>
              <p className="text-muted-foreground text-sm">{stat.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionLayout>
  );
}

function Counter({
  from,
  to,
  duration = 2,
}: {
  from: number;
  to: number;
  duration?: number;
}) {
  const nodeRef = clientef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    const node = nodeRef.current;

    const controls = animate(from, to, {
      duration,
      ease: "easeInOut",

      onUpdate(value) {
        node.textContent = value.toFixed(2);
      },
    });

    return () => controls.stop();
  }, [from, to, duration]);

  return <span ref={nodeRef}>{from}</span>;
}
