import { ProjectData, ProjectStatus } from "../models/project.js";

// Project state management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

// (Singleton Class)
export class ProjectState extends State<ProjectData> {
  private projects: ProjectData[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(dataObj: ProjectData) {
    const newProj: ProjectData = {
      id: dataObj.id,
      title: dataObj.title,
      description: dataObj.description,
      peopleNum: dataObj.peopleNum,
      status: dataObj.status,
    };
    this.projects.push(newProj);
    this.updateListeners();
  }

  moveProject(prjId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((proj) => proj.id === prjId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  updateListeners() {
    this.listeners.forEach((listenerFn) => listenerFn(this.projects.slice()));
  }
}

export const projectState: ProjectState = <ProjectState>(
  ProjectState.getInstance()
);
