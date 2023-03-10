import { Component } from "./base-component";
import { ProjectItem } from "./project-item";
import { ProjectData, ProjectStatus } from "../models/project";
import { projectState } from "../state/project-state";
import { DragTarget } from "../models/drag-drop";
import { AutoBind } from "../decorators/autobind";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: ProjectData[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", "beforeend", `${type}-projects`);

    // Render Content
    this.renderContent();

    // Render Projects
    this.configure();
  }

  @AutoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = <HTMLUListElement>this.element.querySelector("ul");
      listEl.classList.add("droppable");
    }
  }

  @AutoBind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = <HTMLUListElement>this.element.querySelector("ul");
    listEl.classList.remove("droppable");
    console.log("DRAG LEAVE!");
  }

  private renderContent() {
    const listContainer = <HTMLElement>(
      document.getElementById(`${this.element.id}`)
    );
    listContainer.querySelector("ul")!.id = `${this.type}-projects-list`;

    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProj() {
    const projContainer = <HTMLElement>(
      document.getElementById(`${this.type}-projects-list`)
    );
    projContainer.innerHTML = "";
    this.assignedProjects.forEach((prjItem) => {
      new ProjectItem(`${this.type}-projects-list`, prjItem.id, prjItem);
    });
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: ProjectData[]) => {
      this.assignedProjects = projects.filter((prj) => {
        return this.type === "active"
          ? prj.status === ProjectStatus.Active
          : prj.status === ProjectStatus.Finished;
      });
      this.renderProj();
    });
  }
}
