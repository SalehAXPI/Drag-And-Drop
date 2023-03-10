// AutoBind Decorator
export const AutoBind = (
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
) => {
  // set return type to PropertyDescriptor for typescript identify it and change original descriptor with this
  return <PropertyDescriptor>{
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  };
};
