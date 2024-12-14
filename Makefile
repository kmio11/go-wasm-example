.DEFAULT_GOAL := help
ROOT_DIR:=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))
UI_DIR:=$(ROOT_DIR)todo
WASM_DIR=$(ROOT_DIR)wasm

GO_FILES:=$(shell find . -type f -name '*.go' -print)
WASM_BIN:=$(UI_DIR)/public/todo.wasm
WASM_LOADER:=$(UI_DIR)/public/wasm_exec.js

help: ## Help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: wasm  ## build

.PHONY: wasm
wasm: $(WASM_BIN) $(WASM_LOADER)

$(WASM_BIN): $(GO_FILES)
	@cd $(WASM_DIR) && \
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -trimpath -o $(WASM_BIN) ./
	
$(WASM_LOADER):
	cp "`go env GOROOT`/misc/wasm/wasm_exec.js" $(WASM_LOADER)

.PHONY: clean
clean:
	$(RM) $(WASM_BIN)
	$(RM) $(WASM_LOADER)
