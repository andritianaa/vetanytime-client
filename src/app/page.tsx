import { BentoGridSection } from '@/components/landing/bento-section';
import { FAQSection } from '@/components/landing/faq-section';
import { Hero } from '@/components/landing/hero';
import { LandingHeader } from '@/components/landing/landing-header';
import { ReviewTriple } from '@/components/landing/review/review-triple';
import { Services } from '@/components/landing/services';
import { StatsSection } from '@/components/landing/stats-section';
import TeamsSection from '@/components/landing/teams';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground relative flex h-fit flex-col">
      <div className="mt-16"></div>

      <LandingHeader />

      <Hero />

      <StatsSection />

      <BentoGridSection />

      <Services />

      <TeamsSection />

      <ReviewTriple />

      <FAQSection
        faq={[
          {
            question: "Qu'est-ce que VetAnytime ?",
            answer:
              "VetAnytime est une plateforme qui facilite la mise en relation entre vétérinaires et propriétaires d’animaux, permettant la prise de rendez-vous en ligne de manière simple et rapide.",
          },
          {
            question: "Comment prendre rendez-vous avec un vétérinaire ?",
            answer:
              "Il vous suffit de rechercher un vétérinaire près de chez vous, de consulter ses disponibilités et de réserver un créneau directement via l’application.",
          },
          {
            question: "Puis-je choisir le type de consultation ?",
            answer:
              "Oui, vous pouvez choisir entre une consultation en cabinet, à domicile ou en téléconsultation selon les options proposées par le vétérinaire.",
          },
          {
            question: "Comment les vétérinaires sont-ils sélectionnés ?",
            answer:
              "Tous les vétérinaires présents sur VetAnytime sont diplômés et vérifiés afin de garantir la qualité des soins pour vos animaux.",
          },
          {
            question: "Est-ce que je peux annuler ou modifier un rendez-vous ?",
            answer:
              "Oui, vous pouvez annuler ou modifier votre rendez-vous directement depuis votre espace personnel, selon les conditions du vétérinaire.",
          },
          {
            question:
              "Le service est-il payant pour les propriétaires d’animaux ?",
            answer:
              "L’inscription et la prise de rendez-vous sont gratuites pour les propriétaires d’animaux. Seule la consultation avec le vétérinaire est facturée.",
          },
          {
            question: "Comment contacter le support VetAnytime ?",
            answer:
              "Vous pouvez contacter notre support via le formulaire de contact de l’application ou par email pour toute question ou assistance.",
          },
        ]}
      />

      <Footer />
    </div>
  );
}
