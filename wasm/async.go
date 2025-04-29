//go:build wasm

package main

import (
	"fmt"
	"syscall/js"
	"time"
)

func NewError(msg string) js.Value {
	return js.Global().Get("Error").New(msg)
}

func NewCustomWasmError(msg string, code string) js.Value {
	return js.Global().Get("CustomWasmError").New(msg, code)
}

func NewPromise(fn js.Func) js.Value {
	return js.Global().Get("Promise").New(fn)
}

func asyncAdd(_ js.Value, args []js.Value) any {
	num1 := args[0].Int()
	num2 := args[1].Int()

	var handler js.Func
	handler = js.FuncOf(func(this js.Value, p []js.Value) any {
		defer handler.Release()
		resolve := p[0]
		reject := p[1]
		go func() {
			if len(args) != 2 {
				reject.Invoke(NewCustomWasmError("Invalid number of arguments", "INVALID_ARGUMENTS"))
				return
			}

			fmt.Printf("asyncAdd called. calculating %d + %d ...\n", num1, num2)
			time.Sleep(2 * time.Second)
			result := num1 + num2
			if result > 100 {
				reject.Invoke(NewCustomWasmError("Result exceeds limit", "RESULT_EXCEEDS_LIMIT"))
				return
			}

			resolve.Invoke(result)
		}()
		return js.Undefined()
	})

	return NewPromise(handler)
}
