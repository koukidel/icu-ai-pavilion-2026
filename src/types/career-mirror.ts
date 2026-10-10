export type UserMode = 'kids' | 'student' | 'adult';

export interface Phase1Data {
  mode: UserMode;
  selectedInterests: string[];
  customInterest: string;
  selectedDislikes: string[];
  customDislike: string;
}

export interface SocraticQuestion {
  question: string;
  presetOptions: string[];
}

export interface TaskCard {
  id: number;
  taskName: string;
  detail: string;
  category: 'logic' | 'creativity' | 'human' | 'operation';
}

export interface BlueprintResult {
  futureTitle: string;
  futureTitleEn: string;
  catchphrase: string;
  synergyRatio: {
    humanPercent: number;
    aiPercent: number;
  };
  executiveSummary: string;
  coCreationMatrix: {
    aiRole: string[];
    humanCore: string[];
  };
  dayInLife2030: { time: string; action: string }[];
  blueRoseStatement: string;
  hakoniwaParams: {
    avatarCostume: string;
    heldItem: string;
    pedestalType: string;
    ambientLighting: string;
    hologramTitleText: string;
  };
}
