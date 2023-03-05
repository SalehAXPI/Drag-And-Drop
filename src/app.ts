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

type Insert = "afterbegin" | "beforeend";

// Project state management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

// (Singleton Class)
class ProjectState extends State<ProjectData> {
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
    this.listeners.forEach((listenerFn) => listenerFn(this.projects.slice()));
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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  tempEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(
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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: ProjectData[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", "beforeend", `${type}-projects`);

    // Render Content
    this.renderContent();

    // Render Projects
    this.configure();
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

  configure() {
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

const prjInput = new ProjectInput();
const prjCreate = new ProjectList("active");
const prjCreatef = new ProjectList("finished");
