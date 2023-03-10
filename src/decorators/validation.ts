// Reusable validation functionality

const config: { [input: string]: string[] } = {};

const addValidator = (input: string, type: string) => {
  config[input] = config[input] ? [...config[input], type] : [type];
};

// Validation Decorators
export const Required = (_: any, propName: string) =>
  addValidator(propName, "required");

export const TitleMaxLength = (_: any, propName: string) =>
  addValidator(propName, "t_maxlength");

export const DescMaxLength = (_: any, propName: string) =>
  addValidator(propName, "d_maxlength");

export const validation = (inputValues: any): boolean => {
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
