import * as React from "react";

type ToastActionElement = React.ReactNode;

export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4500; 

type ToasterToast = ToastProps & {
  id: string;
};

type State = {
  toasts: ToasterToast[];
};

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

// const actionTypes = {
//   ADD_TOAST: "ADD_TOAST",
//   UPDATE_TOAST: "UPDATE_TOAST",
//   DISMISS_TOAST: "DISMISS_TOAST",
//   REMOVE_TOAST: "REMOVE_TOAST",
// } as const;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return String(count);
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, delay = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, delay);
  toastTimeouts.set(toastId, timeout);
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const toasts = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT);
      return { ...state, toasts };
    }
    case "UPDATE_TOAST": {
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };
    }
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          toastId === undefined || t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }
    case "REMOVE_TOAST": {
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
    }
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

type ToastReturn = {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToasterToast>) => void;
};

export function toast(props: ToastProps = {}): ToastReturn {
  const id = genId();
  const toastObj: ToasterToast = {
    id,
    ...props,
    open: props.open ?? true,
    onOpenChange: (open: boolean) => {
      if (!open) {
        dispatch({ type: "DISMISS_TOAST", toastId: id });
      }
      props.onOpenChange?.(open);
    },
  };

  dispatch({ type: "ADD_TOAST", toast: toastObj });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  const update = (p: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...p, id } as Partial<ToasterToast> & { id: string } });

  const delay = props.duration ?? TOAST_REMOVE_DELAY;
  addToRemoveQueue(id, delay);

  return { id, dismiss, update };
}

export function useToast() {
  const [state, setState] = React.useState<State>(() => memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
