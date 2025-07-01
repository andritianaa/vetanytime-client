import { MarqueeLanding } from "@/components/landing/marquee";
import { SearchForm } from "@/components/landing/search-form";
import { Typography } from "@/components/layout/typography";
import { CircleSvg } from "@/components/svg/circle-svg";
import { CurverdLine } from "@/components/svg/curverd-line";

export const Hero = () => {
  return (
    <>
      <div className="relative isolate flex flex-col">
        <GridBackground />
        <GradientBackground />
        <CurverdLine className="absolute top-[300px] left-7" />
        <main className="relative py-20 pt-36">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-primary bg-primary/10 border-primary mx-auto mb-4 w-fit rounded-full border px-2.5 py-1">
              #1 Pour vos animaux
            </div>
            <div className="mx-auto max-w-5xl text-center">
              <Typography
                variant="h1"
                className="text-5xl font-medium tracking-tight text-balance sm:text-7xl lg:text-7xl"
              >
                Trouvez un vétérinaire gratuitement en{" "}
                <span className="relative inline-block">
                  <span>Belgique</span>
                  <CircleSvg className="fill-primary absolute inset-0" />
                </span>
              </Typography>
              <Typography
                variant="large"
                className="text-muted-foreground mt-8 text-lg font-medium text-pretty sm:text-xl/8"
              >
                Dédié à fournir des soins experts aux animaux de compagnie avec
                amour, confiance et une attention personnalisée pour chaque
                compagnon.
              </Typography>
              <div className="mt-10 flex items-center justify-center gap-x-2">
                <SearchForm />
              </div>
            </div>
            <div className="mx-auto mt-16 flex">
              <div className="flex max-h-[454px] w-full items-center justify-center gap-2">
                <img
                  src="/images/hero-media-1.jpg"
                  alt="Hero Image"
                  className="h-full rounded-tl-[120px] rounded-tr-[24px] rounded-br-[120px] rounded-bl-[24px] transition-all duration-300 hover:rounded-[24px]"
                />
                <img
                  src="/images/hero-media-2.jpg"
                  alt="Hero Image"
                  className="h-full rounded-[262px] transition-all duration-300 hover:rounded-[24px]"
                />
                <img
                  src="/images/hero-media-3.jpg"
                  alt="Hero Image"
                  width={600}
                  height={400}
                  className="h-full rounded-tl-[24px] rounded-tr-[120px] rounded-br-[24px] rounded-bl-[120px] transition-all duration-300 hover:rounded-[24px]"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      <MarqueeLanding />
    </>
  );
};

const GridBackground = () => {
  return (
    <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(180deg,transparent,var(--foreground),transparent)]"></div>
  );
};

const GradientBackground = () => {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="from-primary relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr to-cyan-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="from-primary relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr to-cyan-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
    </>
  );
};
