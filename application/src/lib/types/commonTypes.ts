import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues
} from "react-hook-form";
import { ThreadMetaItem } from "./threadsTypes";

// export interface FormControlProps<T> {
//   value: T;
//   onChange: (value: T) => void;
//   disabled?: boolean;
// }

export interface FormControlProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  state?: ControllerFieldState;
}

export interface PropsWithId {
  id: number;
}

export interface PropsWithThread {
  thread: ThreadMetaItem;
}
