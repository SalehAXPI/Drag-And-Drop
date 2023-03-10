// Interfaces for Drag & drop feature
export interface Draggable {
  dragStartHandler(event: DragEvent): void;

  dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
  // Check the place that drag is over on it is a target then we can use dropHandler
  dragOverHandler(event: DragEvent): void;

  // If drop happens:
  dropHandler(event: DragEvent): void;

  // If it canceled!
  dragLeaveHandler(event: DragEvent): void;
}
