'use strict';

const storedValues = []; // Array to store input values
const screen = document.querySelector('.screen'); // Select the screen div
const history = []; // Store past calculations
let isTouchEvent = false; // Track if a touch event is active
let lastResult = null; // Stores the last calculated result

// Unified event handler for button clicks/taps
function handleEvent(event) {
    if (event.type === "touchstart") isTouchEvent = true;
    if (event.type === "click" && isTouchEvent) return;

    const value = event.target.innerText;
    addToStoredValues(value);

    setTimeout(() => isTouchEvent = false, 200);
}

// Keyboard input handler
function handleKeyboard(event) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 
                         '+', '-', '*', '/', '(', ')', '=', '%', 'Enter', 'Backspace', 'Escape'];
    const key = event.key;

    if (allowedKeys.includes(key)) {
        if (key === 'Enter') {
            addToStoredValues('=');
        } else if (key === 'Backspace') {
            storedValues.pop();
            updateScreen();
        } else if (key === 'Escape') {
            clearCalculator();
        } else {
            addToStoredValues(key);
        }
    }
}

// Function to add values and update the screen
function addToStoredValues(value) {
    // Auto-clear if a new number is entered right after a result
    if (lastResult !== null && !isNaN(value)) {
        clearCalculator();
    }

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
        storedValues.pop(); // Remove last entry
    } else {
        storedValues.push(value);
    }
    
    updateScreen();
}

// Function to update the calculator screen
function updateScreen() {
    screen.innerText = storedValues.join('');
}

// Function to clear the calculator
function clearCalculator() {
    storedValues.length = 0;
    screen.innerText = '';
    lastResult = null;
}

// Using event delegation to handle button clicks
document.body.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") handleEvent(event);
});

document.body.addEventListener("touchstart", (event) => {
    if (event.target.tagName === "BUTTON") handleEvent(event);
});

// Add a listener for keyboard input
document.addEventListener("keydown", handleKeyboard);

// Function to safely calculate result using the Shunting-Yard Algorithm
function calculateResult() {
    try {
        let expression = storedValues.join('');
        let result = evaluateExpression(expression); // Use a safe evaluator

        if (isNaN(result) || !isFinite(result)) {
            throw new Error("Invalid Calculation");
        }

        history.push(`${expression} = ${result}`);
        screen.innerText = result;
        storedValues.length = 0;
        storedValues.push(result.toString()); // Store result for continued calculations
        lastResult = result; // Mark lastResult for auto-clear logic
    } catch (error) {
        screen.innerText = "Error";
        setTimeout(() => clearCalculator(), 2000);
    }
}

// Function to apply percentage logic
function applyPercentage() {
    if (storedValues.length === 0) return;

    let expression = storedValues.join('');
    let lastOperatorIndex = expression.lastIndexOf('+') > expression.lastIndexOf('-') ?
                            expression.lastIndexOf('+') : expression.lastIndexOf('-');

    if (lastOperatorIndex === -1) lastOperatorIndex = expression.lastIndexOf('*') > expression.lastIndexOf('/') ?
                            expression.lastIndexOf('*') : expression.lastIndexOf('/');

    if (lastOperatorIndex === -1) return;

    let baseValue = evaluateExpression(expression.substring(0, lastOperatorIndex)); // Get base number
    let percentageValue = evaluateExpression(expression.substring(lastOperatorIndex + 1)); // Get percentage number

    if (isNaN(baseValue) || isNaN(percentageValue)) {
        screen.innerText = "Error";
        setTimeout(() => clearCalculator(), 2000);
        return;
    }

    let result = 0;
    let operator = expression[lastOperatorIndex];

    switch (operator) {
        case '+':
            result = baseValue + (baseValue * percentageValue / 100);
            break;
        case '-':
            result = baseValue - (baseValue * percentageValue / 100);
            break;
        case '*':
            result = baseValue * (percentageValue / 100);
            break;
        case '/':
            result = baseValue / (percentageValue / 100);
            break;
    }

    history.push(`${expression} = ${result}`);
    screen.innerText = result;
    storedValues.length = 0;
    storedValues.push(result.toString());
    lastResult = result;
}

// Function to evaluate mathematical expressions safely using the Shunting-Yard Algorithm
function evaluateExpression(expression) {
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
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop();
        }
    }

    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    let evaluationStack = [];
    for (let token of outputQueue) {
        if (!isNaN(token)) {
            evaluationStack.push(token);
        } else {
            let b = evaluationStack.pop();
            let a = evaluationStack.pop();
            switch (token) {
                case "+": evaluationStack.push(a + b); break;
                case "-": evaluationStack.push(a - b); break;
                case "*": evaluationStack.push(a * b); break;
                case "/":
                    if (b === 0) throw new Error("Division by zero");
                    evaluationStack.push(a / b);
                    break;
            }
        }
    }

    return evaluationStack.pop();
}
