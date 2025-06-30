"use client";
import Link from 'next/link';

import { Logo } from '@/components/logo';
import { NavClient } from '@/components/navigation/nav-client';
import { Button } from '@/components/ui/button';
import { useClient } from '@/hooks/use-client';

const Navbar = () => {
  const { client, isLoading } = useClient();

  return (
    <>
      <nav className="h-16 bg-background border-b border-accent fixed top-0 w-full z-40">
        <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6">
          <Link href={"/explore"} className="flex-1">
            <Logo color="primary" className="size-28" />
          </Link>

          <div className="flex justify-end flex-1 items-center gap-3">
            {!isLoading && (
              <>
                {client ? (
                  <NavClient variant="avatar" />
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button
                        variant="outline"
                        className="hidden sm:inline-flex"
                      >
                        Connexion
                      </Button>
                    </Link>

                    <Link href="/auth/register">
                      <Button className="xs:inline-flex">{`Let's go`}</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
