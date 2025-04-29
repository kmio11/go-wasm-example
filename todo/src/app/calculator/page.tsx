"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWasm } from "@/hooks/use-wasm";

export default function Calculator() {
  const [number1, setNumber1] = useState<string>("");
  const [number2, setNumber2] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load WASM module
  const todoWasm = useWasm("todoWasm", "/todo.wasm");

  const handleCheck = async () => {
    setIsProcessing(true);

    try {
      if (!todoWasm) {
        setResult("WASM module not loaded yet. Please try again.");
        return;
      }
      const num1 = parseInt(number1, 10);
      const num2 = parseInt(number2, 10);

      const response = await todoWasm.asyncAdd(num1, num2);
      setResult(`Result: ${response}`);
    } catch (error) {
      console.error("Error in calculation process:", error);
      if (error instanceof CustomWasmError) {
        const { code, message } = error;
        setResult(`WASM Error: ${message} (Code: ${code})`);
        return;
      }
      setResult(`An error occurred: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Calculator</h1>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number1">First Number</Label>
            <Input
              id="number1"
              type="text"
              value={number1}
              onChange={(e) => setNumber1(e.target.value)}
              placeholder="Enter first number"
              disabled={isProcessing}
            />
          </div>
          <div>+</div>
          <div className="space-y-2">
            <Label htmlFor="number2">Second Number</Label>
            <Input
              id="number2"
              type="text"
              value={number2}
              onChange={(e) => setNumber2(e.target.value)}
              placeholder="Enter second number"
              disabled={isProcessing}
            />
          </div>
        </div>

        <Button
          onClick={handleCheck}
          disabled={isProcessing || !number1.trim() || !number2.trim()}
        >
          {isProcessing ? "Processing..." : "Calculate"}
        </Button>

        {result && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <div>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
