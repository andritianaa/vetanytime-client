"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function LandingNavbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 z-50 flex w-full items-center justify-center p-4 `}
    >
      {scrolled && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black"></div>
      )}
      <div className="relative flex w-full max-w-[1274px] items-center justify-between">
        <Link href="/#hero">
          <Logo withName color="white" />
        </Link>
        <div className="flex">
          <Link href={"/auth/login"}>
            <Button className="mr-2 flex h-11 rounded-full px-6 transition-all ease-in-out">
              {t(`Get started`)}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
