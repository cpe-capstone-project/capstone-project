import type { PatientInterface } from "./IPatient";
import type { PsychologistInterface } from "./IPsychologist";

export interface TherapyCaseInterface {
  ID?: number;
  CaseTitle?: string;
  CaseDescription?: string;
  CaseStartDate?: string;
  CaseStatusID?: number;

  PsychologistID?: number;
  Psychologist?: PsychologistInterface

  PatientID?: number;
  Patient?: PatientInterface
}
