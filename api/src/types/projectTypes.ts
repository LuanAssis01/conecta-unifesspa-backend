// Enums
export type ProjectStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'FINISHED';
export type AudienceEnum = 'INTERNAL' | 'EXTERNAL';

// Tipo base do projeto
export type Project = {
  id: string;
  name: string;
  subtitle?: string | null;
  overview?: string | null;
  description?: string | null;
  expected_results?: string | null;
  start_date: Date;
  duration: number;
  proposal_document_url?: string | null;
  img_url?: string | null;
  registration_form_url?: string | null;
  numberVacancies: number;
  status: ProjectStatus;
  audience: AudienceEnum;
  courseId?: string | null;
  creatorId?: string | null;
};

// Tipo para projeto com relacionamentos
export type ProjectWithRelations = Project & {
  course?: { id: string; name: string } | null;
  creator?: { id: string; name: string; email: string; role?: string } | null;
  keywords?: { id: string; name: string }[];
  impactIndicators?: { id: string; title: string; value: number }[];
};

// Input para criação de projeto
export interface CreateProjectInput {
  name: string;
  description: string;
  expected_results: string;
  start_date: string | Date;
  duration: number;
  numberVacancies: number;
  audience: AudienceEnum;
  courseId: string;
}

// Input para atualização de projeto
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  expected_results?: string;
  start_date?: string | Date;
  duration?: number;
  numberVacancies?: number;
  audience?: AudienceEnum;
  subtitle?: string;
  overview?: string;
  registration_form_url?: string;
  status?: ProjectStatus;
}

// Input para filtros de busca
export interface ProjectFilters {
  keywords?: string;
  course?: string;
  status?: string;
  search?: string;
}

// Métricas de projetos
export interface ProjectMetrics {
  total: number;
  active: number;
  finished: number;
  inactive: number;
}  