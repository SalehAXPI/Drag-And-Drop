export enum ProjectStatus {
  Active,
  Finished,
}

// Project data interface
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  peopleNum: number;
  status: ProjectStatus;
}

export type Insert = "afterbegin" | "beforeend";
