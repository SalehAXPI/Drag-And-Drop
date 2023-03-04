enum ProjectStatus {
  Active,
  Finished,
}

// Project data interface
interface ProjectData {
  id: string;
  title: string;
  description: string;
  peopleNum: number;
  status: ProjectStatus;
}

type Listener = (items: ProjectData[]) => void;

// Project state management
// (Singleton Class)
class ProjectState {
  private listeners: Listener[] = [];
  private projects: ProjectData[] = [];
  private static instance: ProjectState;

  private constructor() {}

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
    this.listeners.forEach((listenerFn) => listenerFn(this.projects.slice()));
  }

  addListener(listener: Listener) {
    this.listeners.push(listener);
  }
}

const projectState: ProjectState = <ProjectState>ProjectState.getInstance();

// AutoBind Decorator
const AutoBind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
  // set return type to PropertyDescriptor for typescript identify it and change original descriptor with this
  return <PropertyDescriptor>{
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  };
};

// Reusable validation functionality

const config: { [input: string]: string[] } = {};

const addValidator = (input: string, type: string) => {
  config[input] = config[input] ? [...config[input], type] : [type];
};

// Validation Decorators
const Required = (_: any, propName: string) =>
  addValidator(propName, "required");

const TitleMaxLength = (_: any, propName: string) =>
  addValidator(propName, "t_maxlength");

const DescMaxLength = (_: any, propName: string) =>
  addValidator(propName, "d_maxlength");

const validation = (inputValues: any): boolean => {
  return Object.entries(config).every(([input, types]) =>
    types.every(
      (type) =>
        (type === "required" && inputValues[input].value.trim().length > 0) ||
        (type === "t_maxlength" && inputValues[input].value.length <= 15) ||
        (type === "d_maxlength" && inputValues[input].value.length <= 25)
    )
  );

  // for (const inputValuesKey in config) {
  //     for (const inputValuesKeyElement of config[inputValuesKey]) {
  //         if (
  //             !(
  //                 (inputValuesKeyElement === "required" &&
  //                     inputValues[inputValuesKey].value.trim().length > 0) ||
  //                 (inputValuesKeyElement === "t_maxlength" &&
  //                     inputValues[inputValuesKey].value.length <= 15) ||
  //                 (inputValuesKeyElement === "d_maxlength" &&
  //                     inputValues[inputValuesKey].value.length <= 25)
  //             )
  //         )
  //             return false;
  //     }
  // }
  // return true;
};

class ProjectInput {
  // Type Casting
  tempEl: HTMLTemplateElement = <HTMLTemplateElement>(
    document.getElementById("project-input")
  );

  hostEl: HTMLDivElement = document.getElementById("app") as HTMLDivElement;

  formEl: HTMLFormElement = document.importNode(this.tempEl.content, true)
    .firstElementChild as HTMLFormElement;

  @TitleMaxLength @Required titleInputEl: HTMLInputElement = <HTMLInputElement>(
    this.formEl.querySelector("#title")
  );

  @DescMaxLength @Required descriptionInputEl: HTMLInputElement = <
    HTMLInputElement
  >this.formEl.querySelector("#description");

  peopleInputEl: HTMLInputElement = <HTMLInputElement>(
    this.formEl.querySelector("#people")
  );

  constructor() {
    // Insert Form to HTML
    this.attach();

    // Add Submit Button Listener for Submission
    this.configSubmission();
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.formEl);
  }

  private configSubmission() {
    this.formEl.addEventListener("submit", this.submitHandler);
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
      Array.from(this.formEl.querySelectorAll("input")),
      Array.from(this.formEl.querySelectorAll("textarea")),
    ]
      .flat()
      .map((el) => (el.value = ""));
  }
}

class ProjectList {
  tempEl: HTMLTemplateElement = <HTMLTemplateElement>(
    document.getElementById("project-list")
  );

  hostEl: HTMLDivElement = document.getElementById("app") as HTMLDivElement;

  element: HTMLElement = <HTMLElement>(
    document.importNode(this.tempEl.content, true).firstElementChild
  );

  assignedProjects: ProjectData[] = [];

  constructor(private type: "active" | "finished") {
    this.element.id = `${this.type}-projects`;

    // Insert Element in HTML
    this.attach();

    // Render Content
    this.renderContent();

    projectState.addListener((projects: ProjectData[]) => {
      this.assignedProjects = projects;
      this.renderProj();
    });
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.element);
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
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      projContainer.appendChild(listItem);
    });
  }
}

const prjInput = new ProjectInput();
const prjCreate = new ProjectList("active");
const prjCreatef = new ProjectList("finished");
