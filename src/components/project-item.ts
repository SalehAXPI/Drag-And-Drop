import { Component } from "./base-component";
import { ProjectData } from "../models/project";
import { AutoBind } from "../decorators/autobind";
import { Draggable } from "../models/drag-drop";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLElement>
  implements Draggable
{
  get persons() {
    return this.project.peopleNum === 1
      ? "1 Person Assigned"
      : `${this.project.peopleNum} Persons Assigned`;
  }

  constructor(
    protected hostId: string,
    protected liId: string,
    protected project: ProjectData
  ) {
    super("single-project", hostId, "beforeend", liId);
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @AutoBind
  dragEndHandler(_: DragEvent) {
    console.log("Drag End");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    const li = document.getElementById(this.liId)!;
    li.querySelector("h2")!.textContent = this.project.title;
    li.querySelector("h3")!.textContent = this.project.description;
    li.querySelector("p")!.textContent = this.project.peopleNum.toString();
  }
}
