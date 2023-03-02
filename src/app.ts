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
      console.log(userInputs);
      return;
    }

    alert("Invalid input, please try again!");
  }

  private gatherUserInput(): [string, string, number] {
    return [
      this.titleInputEl.value,
      this.descriptionInputEl.value,
      +this.peopleInputEl.value,
    ];
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

  constructor(private type: "active" | "finished") {
    this.element.id = `${this.type}-projects`;

    // Insert Element in HTML
    this.attach();

    // Render Content
    this.renderContent();
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.element);
  }

  private renderContent() {
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

const prjInput = new ProjectInput();
const prjCreate = new ProjectList("active");
const prjCreatef = new ProjectList("finished");
