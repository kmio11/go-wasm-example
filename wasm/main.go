//go:build wasm

package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"syscall/js"
	"time"
)

func ErrorResult(message string) map[string]any {
	return map[string]any{
		"ok":      false,
		"message": message,
	}
}

func Uint8ArrayToGoByte(arg js.Value) []byte {
	received := make([]byte, arg.Get("length").Int())
	_ = js.CopyBytesToGo(received, arg)
	return received
}

func add(_ js.Value, args []js.Value) any {
	if len(args) != 2 {
		return ErrorResult("invalid number of arguments")
	}

	a, b := args[0].Int(), args[1].Int()
	result := a + b

	return map[string]any{
		"ok":   true,
		"data": js.ValueOf(result),
	}
}

type Task struct {
	ID          string `json:"id,omitempty"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
}

func importCsv(_ js.Value, args []js.Value) any {
	if len(args) != 1 {
		return ErrorResult("invalid number of arguments")
	}
	data := Uint8ArrayToGoByte(args[0])

	reader := csv.NewReader(strings.NewReader(string(data)))
	records, err := reader.ReadAll()
	if err != nil {
		return ErrorResult("failed to parse CSV")
	}

	var tasks []Task
	for i, record := range records {
		if len(record) != 4 {
			return ErrorResult("invalid number of columns")
		}
		if i == 0 {
			if record[0] != "id" || record[1] != "title" || record[2] != "description" || record[3] != "completed" {
				return ErrorResult("invalid header")
			}
			continue
		}

		id := record[0]
		completed, err := strconv.ParseBool(record[3])
		if err != nil {
			return ErrorResult("invalid completed value")
		}
		task := Task{
			ID:          id,
			Title:       record[1],
			Description: record[2],
			Completed:   completed,
		}
		tasks = append(tasks, task)
	}

	value, err := json.Marshal(tasks)
	if err != nil {
		return ErrorResult(fmt.Sprintf("failed to marshal tasks: %v", err))
	}

	return map[string]any{
		"ok":   true,
		"data": string(value),
	}
}

func printHeartBeatForDebug(ctx context.Context) {
	startAt := time.Now().Format(time.RFC3339Nano)
	ticker := time.NewTicker(5 * time.Second)
	go func() {
		for {
			select {
			case <-ticker.C:
				println("wasm is running... startAt:", startAt)
			case <-ctx.Done():
				return
			}
		}
	}()
}

//go:wasmimport env onInitialized
func onInitialized()

func main() {
	fmt.Println("wasm: main()")
	printHeartBeatForDebug(context.TODO())

	c := make(chan struct{})
	js.Global().Set("todoWasm", js.ValueOf(map[string]any{
		"add":       js.FuncOf(add),
		"importCsv": js.FuncOf(importCsv),
		"asyncAdd":  js.FuncOf(asyncAdd),
	}))
	onInitialized()
	<-c
}
