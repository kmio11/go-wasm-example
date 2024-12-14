import { useSyncExternalStore } from "react";

import { WasmInstance, WasmName } from "@/types/wasm";

type WasmStore<TWasm> = {
  set: (v: TWasm) => void;
  subscribe: Parameters<typeof useSyncExternalStore>[0];
  getSnapshot: Parameters<typeof useSyncExternalStore<TWasm>>[1];
  getServerSnapshot: Parameters<typeof useSyncExternalStore<TWasm>>[2];
};

type WasmStores = {
  [key in WasmName]: WasmStore<WasmInstance<key> | undefined>;
};

const wasmStores: WasmStores = {} as WasmStores;

const createWasmStore = <TWasm>(initialValue: TWasm): WasmStore<TWasm> => {
  let value = initialValue;
  const listeners: (() => void)[] = [];

  return {
    set: (v: TWasm) => {
      value = v;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    },
    getSnapshot: (): TWasm => {
      return value;
    },
    getServerSnapshot: (): TWasm => {
      return value;
    },
  };
};

const initialize = async <TWasmName extends WasmName>(
  name: TWasmName,
  url: string
): Promise<WasmInstance<TWasmName> | undefined> => {
  if (typeof window === "undefined") {
    return;
  }

  // @ts-expect-error : fixed phrase for loading wasm.
  await import("./wasm_exec.js");
  const go = new Go();

  const isReady = new Promise((resolve) => {
    go.importObject.env = {
      onInitialized: function (value: unknown) {
        resolve(value);
        return 0;
      },
    };
  });

  if ("instantiateStreaming" in WebAssembly) {
    await WebAssembly.instantiateStreaming(fetch(url), go.importObject).then(
      (obj) => {
        go.run(obj.instance);
      }
    );
  } else {
    await fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then((bytes) =>
        WebAssembly.instantiate(bytes, go.importObject).then((obj) => {
          go.run(obj.instance);
        })
      );
  }

  await isReady;
  return window[name];
};

export const useWasm = <
  TWasmName extends WasmName,
  TWasm extends WasmInstance<TWasmName>
>(
  name: TWasmName,
  url: string
) => {
  if (!wasmStores[name]) {
    // @ts-expect-error : Assign forcibly because the types do not match.
    wasmStores[name] = createWasmStore<TWasm | undefined>(undefined);
    initialize(name, url).then((value) => {
      wasmStores[name]?.set(value);
    });
  }
  return useSyncExternalStore(
    wasmStores[name].subscribe,
    wasmStores[name].getSnapshot,
    wasmStores[name].getServerSnapshot
  );
};
