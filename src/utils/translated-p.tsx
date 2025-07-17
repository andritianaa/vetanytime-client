"use client";
export type TranslatedPProps = {
  text: string[];
  className?: string;
};

export const TRP = (props: TranslatedPProps) => {
  return <p className={props.className}>{props.text[0]}</p>;
};
