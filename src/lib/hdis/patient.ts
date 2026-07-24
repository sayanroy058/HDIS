export type Patient = {
  id: string;
  label: string;
  age: number;
  sex: "F" | "M";
  bed: string;
  history: string[];
  allergies: string[];
  medications: string[];
  riskFactors: {
    postOp: boolean;
    indwellingCatheter: boolean;
    immunosuppressed: boolean;
    peRisk: boolean;
  };
  egfr: number; // mock estimated glomerular filtration rate (mL/min/1.73m²)
};

export const demoPatient: Patient = {
  id: "P-04",
  label: "Patient 04",
  age: 62,
  sex: "F",
  bed: "Bed 7",
  history: ["Post-op day 3 (laparotomy)", "Indwelling urinary catheter", "T2 diabetes"],
  allergies: ["Penicillin (rash)"],
  medications: ["Metformin", "Enoxaparin (prophylactic)"],
  riskFactors: {
    postOp: true,
    indwellingCatheter: true,
    immunosuppressed: false,
    peRisk: false,
  },
  egfr: 78,
};
