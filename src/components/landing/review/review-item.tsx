import { Typography } from '@/components/layout/typography';
import { ClientMarkdown } from '@/components/markdown/client-markdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { ComponentPropsWithoutRef } from "react";

export type ReviewItemProps = {
  /**
   * The review of the client. Use **bold** text to highlight.
   */
  review: string;
  /**
   * The name of the client.
   */
  name: string;
  /**
   * The role of the client. (his job)
   */
  role: string;
  /**
   * The image of the client.
   */
  image: string;
} & ComponentPropsWithoutRef<"div">;

export const ReviewItem = ({ className, ...props }: ReviewItemProps) => {
  return (
    <Card className={cn("h-fit", className)} {...props}>
      <CardHeader>
        <ClientMarkdown className="citation">{props.review}</ClientMarkdown>
      </CardHeader>
      <CardContent className="bg-background flex items-center gap-2 rounded-lg pt-6">
        <div>
          <Avatar>
            <AvatarFallback>{props.name[0]}</AvatarFallback>
            <AvatarImage src={props.image} alt="client image" />
          </Avatar>
        </div>
        <div>
          <Typography variant="small">{props.name}</Typography>
          <Typography variant="muted">{props.role}</Typography>
        </div>
      </CardContent>
    </Card>
  );
};
