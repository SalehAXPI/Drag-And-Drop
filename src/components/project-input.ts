import { Component } from "./base-component.js";
import { ProjectStatus, ProjectData } from "../models/project.js";
import { projectState } from "../state/project-state.js";
import {
  DescMaxLength,
  Required,
  TitleMaxLength,
  validation,
} from "../decorators/validation.js";
import { AutoBind } from "../decorators/autobind.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  @TitleMaxLength @Required titleInputEl: HTMLInputElement = <HTMLInputElement>(
    this.element.querySelector("#title")
  );

  @DescMaxLength @Required descriptionInputEl: HTMLInputElement = <
    HTMLInputElement
  >this.element.querySelector("#description");

  peopleInputEl: HTMLInputElement = <HTMLInputElement>(
    this.element.querySelector("#people")
  );

  constructor() {
    super("project-input", "app", "afterbegin");

    // Add Submit Button Listener for Submission
    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  @AutoBind
  private submitHandler(ev: Event) {
    ev.preventDefault();
    const userInputs = this.gatherUserInput();

    if (validation(this)) {
      this.clearInputs();
      projectState.addProject(userInputs);
      return;
    }

    alert("Invalid input, please try again!");
  }

  private gatherUserInput(): ProjectData {
    return {
      id: Math.round(Math.random() * 1_000_000_000).toString(),
      title: this.titleInputEl.value,
      description: this.descriptionInputEl.value,
      peopleNum: +this.peopleInputEl.value,
      status: ProjectStatus.Active,
    };
  }

  private clearInputs() {
    [
      Array.from(this.element.querySelectorAll("input")),
      Array.from(this.element.querySelectorAll("textarea")),
    ]
      .flat()
      .map((el) => (el.value = ""));
  }
}
