/* eslint-disable no-var */

export type WasmName = "todoWasm";

export type WasmInstance<K extends WasmName> = (typeof global)[K];

declare global {
  declare type WasmSuccess<TResult> = { ok: true; data: TResult };

  declare type WasmError<TErrCode = string> = {
    ok: false;
    message: string;
    code?: TErrCode;
  };

  declare type WasmResult<TResult, TErrCode = string> =
    | WasmSuccess<TResult>
    | WasmError<TErrCode>;

  declare var todoWasm: {
    add: (a: number, b: number) => WasmResult<number, undefined>;
    importCsv: (bytes: Uint8Array) => WasmResult<string, undefined>;
    asyncAdd: (any: number, b: number) => Promise<number>;
  };

  namespace globalThis {
    class CustomWasmError extends Error {
      code: string;
      constructor(message: string, code: string);
    }
    export { CustomWasmError };
  }
}
