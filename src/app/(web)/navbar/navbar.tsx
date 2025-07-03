import Link from 'next/link';

import { Logo } from '@/components/logo';
import { NavClient } from '@/components/navigation/nav-user';
import { Button } from '@/components/ui/button';
import { Client } from '@prisma/client';

import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';

const Navbar = ({ client }: { client?: Client | undefined }) => {
  return (
    <nav className="h-16 backdrop-blur-lg  border-accent w-full z-50 fixed top-0 bg-background/80">
      <div className="relative z-50 h-full flex items-center justify-between max-w-screen-2xl mx-auto px-4 sm:px-6">
        <Logo withName />

        <NavMenu className="hidden md:block" />
        {client ? (
          <NavClient variant="avatar" />
        ) : (
          <div className="flex items-center gap-3">
            <Link href="https://pro.vetanytime.be" target="_blank">
              <Button variant="outline" className="hidden sm:inline-flex">
                Vous êtes professionnel ?
              </Button>
            </Link>

            <Link href="/auth/register">
              <Button className="xs:inline-flex">Connexion</Button>
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
