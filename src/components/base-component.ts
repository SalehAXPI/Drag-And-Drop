import { Insert } from "../models/project";

// Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  tempEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  protected constructor(
    tempElId: string,
    hostElId: string,
    insert: Insert,
    newElId?: string
  ) {
    this.tempEl = <HTMLTemplateElement>document.getElementById(tempElId);
    const importedNode = document.importNode(this.tempEl.content, true);
    this.element = <U>importedNode.firstElementChild;

    if (newElId) this.element.id = newElId;

    this.hostEl = <T>document.getElementById(hostElId);

    this.attach(insert);
  }

  private attach(insert: Insert) {
    this.hostEl.insertAdjacentElement(insert, this.element);
  }

  abstract configure(): void;
}
