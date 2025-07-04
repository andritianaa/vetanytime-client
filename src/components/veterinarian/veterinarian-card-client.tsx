"use client";

import {
    VeterinarianCard as VeterinarianCardBase, VeterinarianCardProps
} from './veterinarian-card';

export const VeterinarianCard = (props: VeterinarianCardProps) => {
  return <VeterinarianCardBase {...props} />;
};
