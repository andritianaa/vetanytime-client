import { GoalIcon } from '@/components/icons/goal';
import { MetaIcon } from '@/components/icons/meta';
import { ReadyIcon } from '@/components/icons/ready';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export type sidebarProps = {
  currentStep: number;
};

export const OnboardingSidebar = (props: sidebarProps) => {
  return (
    <div className="max-w-[440px] h-full bg-[#F6F6F6] w-full p-4">
      <Logo color="primary" className="w-36 mb-28" />
      <div className="">
        <Step
          step={1}
          icon={MetaIcon}
          title="Connectez votre compte Meta Ads"
          description="Pour analyser vos campagnes, vous devez lier votre compte publicitaire."
          isCurrent={props.currentStep === 1}
        />
        <Step
          step={2}
          icon={GoalIcon}
          title="Quel est votre objectif principal ?"
          description="Nous adapterons l’analyse à votre intention publicitaire."
          isCurrent={props.currentStep === 2}
        />
        <Step
          step={3}
          icon={ReadyIcon}
          title="Votre espace est prêt"
          description="Vetanytime commence à analyser vos campagnes. Vous pouvez accéder à votre tableau de bord."
          isCurrent={props.currentStep === 3}
        />
      </div>
    </div>
  );
};

export type stepProps = {
  step: number;
  icon: React.ComponentType;
  isCurrent: boolean;
  title: string;
  description: string;
};

export const Step = (props: stepProps) => {
  return (
    <div className="flex gap-4 mb-8">
      <div className="">
        <props.icon />
      </div>
      <div className="">
        <p
          className={cn(
            "text-md font-semibold",
            props.isCurrent ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {props.title}
        </p>
        <p className="text-muted-foreground">{props.description}</p>
      </div>
    </div>
  );
};
