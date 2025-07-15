import {
  Avis,
  CareType,
  City,
  Consultation,
  ConsultationType,
  Organization,
  OrganizationClient,
  OrganizationPet,
} from "@prisma/client";

export interface AdminVeterinairesResponse {
  organizations: (Organization & {
    city: City | null;
    careType: CareType | null;
  })[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface VeterinaireFullProfile {
  organization: Organization & {
    city: City | null;
    careType: CareType | null;
    Avis: Avis | null;
    Consultation: Consultation | null;
    consultationTypes: ConsultationType | null;
    OrganizationClient: OrganizationClient | null;
    OrganizationPet: OrganizationPet | null;
  };
}
