import FAQ from '@/app/(web)/components/faq';
import Features from '@/app/(web)/components/features';
import Footer from '@/app/(web)/components/footer';
import { Navbar } from '@/app/(web)/components/navbar';
import Pricing from '@/app/(web)/components/pricing';
import Testimonial from '@/app/(web)/components/testimonial';

import Hero from './components/hero';

export default async function RoutePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <FAQ />
      <Testimonial />
      <Pricing />
      <Footer />
    </>
  );
}
