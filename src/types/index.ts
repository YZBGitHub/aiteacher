export type PageId = 'home' | 'login' | 'plan-list' | 'plan-create' | 'plan-workbench' | 'ppt' | 'resources' | 'knowledge';

export type ResourceTab = 'syllabus' | 'question-bank' | 'standard';

export interface KnowledgeChunk {
  id: string;
  content: string;
  sourceFile: string;
  similarity?: number;
  section?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  category: string;
  vectorCount: number;
  status: 'ready' | 'syncing' | 'offline';
  description: string;
  selected?: boolean;
  docCount?: number;
  updatedAt?: string;
  department?: string;
  files?: ReferenceFile[];
  sampleChunks?: KnowledgeChunk[];
}

export interface ReferenceFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt';
  status: 'parsing' | 'completed' | 'failed';
  isKeyReference: boolean;
  parseTime?: string;
  extractedSnippet?: string;
}

export interface CourseResourcePackage {
  id: string;
  courseName: string;
  title: string;
  specialty: string;
  packageType: string;
  totalHours: number;
  projectCount: number;
  questionCount: number;
  hasStandard: boolean;
  description: string;
  instructor: string;
  updatedAt: string;
  tags: string[];
  modules: SyllabusModule[];
  questions: QuestionItem[];
  standardDoc: CurriculumStandardDoc;
}

export interface PlanConfig {
  courseName: string;
  trainingProject: string;
  textbookVersion: string;
  pedagogyTheory: string;
  lessonType: string;
  periods: number; // e.g. 2
  targetAudience: string;
  selectedObjectives: string[];
  customObjective: string;
  studentAnalysis: string;
  teachingStoryline: string;
  situationPreference: string;
  otherRequirements: string;
  archiveTemplate: string;
  sections: { id: string; name: string; enabled: boolean; required: boolean }[];
  selectedKnowledgeBases: string[];
  referenceFiles: ReferenceFile[];
}

export interface TeachingStep {
  stepName: string; // 资讯、计划、决策、实施、检查、评价
  duration: number; // minutes
  teacherActivity: string;
  studentActivity: string;
  mediaTool: string;
  deliverable: string;
  assessmentPoint: string;
}

export interface LessonPlanDocument {
  id: string;
  version: string;
  title: string;
  subTitle: string;
  courseName: string;
  project: string;
  periods: number;
  instructor: string;
  college: string;
  academicYear: string;
  archiveNumber: string;
  lastSavedAt: string;
  status: 'saved' | 'saving' | 'error';
  approvalStatus?: '已归档' | '待审核' | '已通过' | '编制中';
  coverType?: 'circuit' | 'motor' | 'plc' | 'robot';
  updatedAt?: string;
  tags?: string[];
  // Sections
  basicInfo: {
    courseType: string;
    classGroup: string;
    venue: string;
    devices: string[];
  };
  studentAnalysis: string;
  learningObjectives: {
    knowledge: string[];
    skills: string[];
    literacy: string[];
  };
  keyAndDifficultPoints: {
    keyPoint: string;
    keyResolution: string;
    difficultPoint: string;
    difficultResolution: string;
  };
  teachingPreparation: {
    tools: string[];
    components: { code: string; name: string; spec: string; count: number }[];
    safetyRules: string[];
  };
  teachingSteps: TeachingStep[];
  circuitInfo: {
    title: string;
    code: string;
    caption: string;
    components: { code: string; name: string; role: string }[];
  };
  formulas: {
    title: string;
    latex: string;
    explanation: string;
  }[];
  evaluationRubric: {
    dimension: string;
    weight: string;
    criteria: string;
  }[];
  homeworkAndExtension: string[];
}

export interface DiffSuggestion {
  id: string;
  targetSection: string;
  reason: string;
  summary: string;
  beforeSnippet: string;
  afterSnippet: string;
  affectedSections: string[];
}

export interface PptSlide {
  id: string;
  slideNumber: number;
  title: string;
  subTitle?: string;
  bulletPoints: string[];
  notes?: string;
  layout: 'title' | 'bullet' | 'split' | 'circuit' | 'formula' | 'summary';
  accent?: string;
  hasDiagram?: boolean;
  hasFormula?: boolean;
}

export interface SyllabusModule {
  id: string;
  projectNumber: string;
  title: string;
  tasks: string;
  theoryHours: number;
  practiceHours: number;
  objectives: string;
  assessment: string;
}

export interface QuestionItem {
  id: string;
  type: '单选题' | '多选题' | '判断题' | '故障分析题';
  skillPoint: string;
  difficulty: '初级' | '中级' | '高级';
  stem: string;
  options?: string[];
  answer: string;
  analysis: string;
  hasCircuitReference?: boolean;
}

export interface CurriculumStandardDoc {
  specialtyName: string;
  specialtyCode: string;
  courseNature: string;
  targetJobRoles: string[];
  suggestedHours: number;
  credits: number;
  coreCompetencies: string[];
  courseDescription: string;
  courseObjectives: {
    quality: string[];
    knowledge: string[];
    capability: string[];
  };
  contentAndRequirements: {
    module: string;
    hours: number;
    tasks: string[];
    standards: string;
  }[];
  implementationConditions: {
    teachers: string;
    equipment: string;
    resources: string;
  };
  evaluationMethod: string;
}
