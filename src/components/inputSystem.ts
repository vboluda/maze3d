import type { RuntimeInputState } from "./gameRuntimeTypes";

const DEFAULT_CONTROL_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

export type InputSystem = {
  state: RuntimeInputState;
  dispose: () => void;
};

type CreateInputSystemParams = {
  target?: Window;
  controlKeys?: Set<string>;
};

export const createInputSystem = ({
  target = window,
  controlKeys = DEFAULT_CONTROL_KEYS,
}: CreateInputSystemParams = {}): InputSystem => {
  const state: RuntimeInputState = {
    pressed: new Set<string>(),
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (controlKeys.has(key)) {
      state.pressed.add(key);
      event.preventDefault();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    state.pressed.delete(event.key.toLowerCase());
  };

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);

  return {
    state,
    dispose: () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      state.pressed.clear();
    },
  };
};