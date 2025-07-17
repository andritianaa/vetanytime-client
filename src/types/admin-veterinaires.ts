import {
    Association, Avis, CareType, City, Conference, Consultation, ConsultationType, Contact,
    Experience, Formation, Organization, OrganizationClient, OrganizationPet, Research
} from '@prisma/client';

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

export type VeterinaireFullProfile = Organization & {
  city: City | null;
  careType: CareType | null;
  contactList: Contact[];
  consultationTypes: ConsultationType[];
  Consultation: Consultation[];
  Avis: Avis[];
  OrganizationClient: OrganizationClient[];
  OrganizationPet: OrganizationPet[];
  OrganizationSpecialisation: {
    specialisation: {
      id: string;
      name: string;
    };
  }[];
  formationsList: Formation[];
  conferencesList: Conference[];
  experiencesList: Experience[];
  researchList: Research[];
  associationsList: Association[];
};
