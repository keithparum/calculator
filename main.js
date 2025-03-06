"use strict";

// Store input values as tokens
let storedValues = [];
let lastResult = null; // Holds the last computed result
let isTouchEvent = false; // Prevent duplicate event triggers

// Get the display element and create a history array (optional)
const screen = document.querySelector(".screen");
const history = [];

// Unified event handler for button clicks/touches
function handleEvent(event) {
  if (event.type === "touchstart") isTouchEvent = true;
  if (event.type === "click" && isTouchEvent) return;

  const value = event.target.innerText;
  addToStoredValues(value);

  setTimeout(() => (isTouchEvent = false), 200);
}

// Keyboard input handler for allowed keys
function handleKeyboard(event) {
  const allowedKeys = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ".",
    "+",
    "-",
    "*",
    "/",
    "(",
    ")",
    "=",
    "%",
    "Enter",
    "Backspace",
    "Escape",
  ];
  const key = event.key;

  if (allowedKeys.includes(key)) {
    if (key === "Enter" || key === "=") {
      addToStoredValues("=");
    } else if (key === "Backspace") {
      storedValues.pop();
      updateScreen();
    } else if (key === "Escape") {
      clearCalculator();
    } else {
      addToStoredValues(key);
    }
  }
}

// Add input value and update the display
function addToStoredValues(value) {
  // Only auto-clear previous result if the storedValues holds just the result
  // This prevents clearing when an operator was already added after "=".
  if (lastResult !== null && !isNaN(value) && storedValues.length === 1) {
    clearCalculator();
  }

  // Special buttons
  if (value === "=") {
    calculateResult();
    return;
  } else if (value === "%") {
    applyPercentage();
    return;
  } else if (value === "C") {
    clearCalculator();
    return;
  } else if (value === "◀") {
    storedValues.pop();
  } else if (value === "x²") {
    // Square the current value
    let current = evaluateCurrentValue();
    if (current !== null) {
      let result = current * current;
      history.push(`${current}² = ${result}`);
      screen.innerText = result;
      storedValues = [result.toString()];
      lastResult = result;
      return;
    }
  } else {
    // Prevent consecutive operator inputs – replace the last operator if necessary
    const operators = ["+", "-", "*", "/"];
    if (
      operators.includes(value) &&
      operators.includes(storedValues[storedValues.length - 1])
    ) {
      storedValues[storedValues.length - 1] = value;
    } else {
      storedValues.push(value);
    }
  }

  updateScreen();
}

// Update the calculator display
function updateScreen() {
  screen.innerText = storedValues.join("") || "0";
}

// Clear the calculator state and display
function clearCalculator() {
  storedValues = [];
  screen.innerText = "0";
  lastResult = null;
}

// Evaluate the current display value as a number
function evaluateCurrentValue() {
  try {
    let expression = storedValues.join("");
    let result = evaluateExpression(expression);
    if (!isNaN(result) && isFinite(result)) {
      return result;
    }
  } catch (error) {
    screen.innerText = "Error";
    setTimeout(clearCalculator, 1500);
  }
  return null;
}

// Safely evaluate an arithmetic expression using the Shunting-Yard algorithm
function evaluateExpression(expression) {
  // If the expression starts with a minus, prepend a 0 to support unary minus.
  if (expression[0] === "-") {
    expression = "0" + expression;
  }

  let outputQueue = [];
  let operatorStack = [];
  let tokens = expression.match(/(\d+(\.\d+)?|[\+\-\*\/\(\)])/g);
  if (!tokens) throw new Error("Invalid Expression");

  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const isOperator = (ch) => ["+", "-", "*", "/"].includes(ch);

  for (let token of tokens) {
    if (!isNaN(token)) {
      outputQueue.push(parseFloat(token));
    } else if (isOperator(token)) {
      while (
        operatorStack.length &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) throw new Error("Mismatched parentheses");
      operatorStack.pop();
    }
  }

  while (operatorStack.length) {
    let op = operatorStack.pop();
    if (op === "(" || op === ")") throw new Error("Mismatched parentheses");
    outputQueue.push(op);
  }

  // Evaluate the Reverse Polish Notation (RPN) expression
  let evaluationStack = [];
  for (let token of outputQueue) {
    if (typeof token === "number") {
      evaluationStack.push(token);
    } else {
      let b = evaluationStack.pop();
      let a = evaluationStack.pop();
      switch (token) {
        case "+":
          evaluationStack.push(a + b);
          break;
        case "-":
          evaluationStack.push(a - b);
          break;
        case "*":
          evaluationStack.push(a * b);
          break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          evaluationStack.push(a / b);
          break;
      }
    }
  }

  let result = evaluationStack.pop();
  // Round to avoid long decimals
  if (!Number.isInteger(result)) {
    result = parseFloat(result.toFixed(8));
  }
  return result;
}

// Calculate the result when "=" is pressed
function calculateResult() {
  try {
    let expression = storedValues.join("");
    let result = evaluateExpression(expression);
    if (isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid Calculation");
    }
    history.push(`${expression} = ${result}`);
    screen.innerText = result;
    storedValues = [result.toString()];
    lastResult = result;
  } catch (error) {
    screen.innerText = "Error";
    setTimeout(clearCalculator, 1500);
  }
}

// Apply percentage operation to the current expression
function applyPercentage() {
  let expression = storedValues.join("");
  let lastOperatorIndex = Math.max(
    expression.lastIndexOf("+"),
    expression.lastIndexOf("-"),
    expression.lastIndexOf("*"),
    expression.lastIndexOf("/")
  );
  if (lastOperatorIndex === -1) return;

  let baseValue = evaluateExpression(
    expression.substring(0, lastOperatorIndex)
  );
  let percentageValue = evaluateExpression(
    expression.substring(lastOperatorIndex + 1)
  );

  if (isNaN(baseValue) || isNaN(percentageValue)) {
    screen.innerText = "Error";
    setTimeout(clearCalculator, 1500);
    return;
  }

  let operator = expression[lastOperatorIndex];
  let result = 0;
  switch (operator) {
    case "+":
      result = baseValue + (baseValue * percentageValue) / 100;
      break;
    case "-":
      result = baseValue - (baseValue * percentageValue) / 100;
      break;
    case "*":
      result = baseValue * (percentageValue / 100);
      break;
    case "/":
      result = baseValue / (percentageValue / 100);
      break;
  }

  history.push(`${expression} = ${result}`);
  screen.innerText = result;
  storedValues = [result.toString()];
  lastResult = result;
}

// Add event listeners for buttons and keyboard events
document.body.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") handleEvent(event);
});
document.body.addEventListener("touchstart", (event) => {
  if (event.target.tagName === "BUTTON") handleEvent(event);
});
document.addEventListener("keydown", handleKeyboard);
