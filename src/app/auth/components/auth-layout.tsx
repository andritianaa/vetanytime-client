import Image from "next/image";

import { Logo } from "@/components/logo";

import type React from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex relative">
      <div className="w-full h-screen flex items-center justify-center relative">
        <img
          src="/media/grid.png"
          alt="grid"
          className="absolute left-1/2 -translate-x-1/2 z-0 h-auto w-[calc(100%-8rem)] max-w-[800px] h-screen/3 top-0"
        />
        <div className="max-w-sm w-full my-auto ">
          <div className="flex flex-col max-lg:pt-16 items-center relative">
            <Logo className="size-12 relative z-10" />
            <h1 className="text-3xl font-semibold tracking-tight relative z-10 mb-2">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground text-center relative z-10  mb-8">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>

      <Image
        src={"https://images.pexels.com/photos/245035/pexels-photo-245035.jpeg"}
        alt="Preview image"
        width={400}
        height={1500}
        className="h-screen w-auto ratio-16/9 object-cover hidden lg:block"
      />
    </div>
  );
}
