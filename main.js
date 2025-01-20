'use strict'

const storedValues = []; // Array to store clicked/tapped values
const screen = document.querySelector('.screen'); // Select the screen div
let isTouchEvent = false; // Flag to track if a touch event is currently active

// Unified event handler for button clicks/taps
function handleEvent(event) {
    // If this is a touch event, prevent it from triggering a click
    if (event.type === "touchstart") {
        isTouchEvent = true;
    }

    // If this is a click event but a touch event was already triggered, ignore it
    if (event.type === "click" && isTouchEvent) {
        return;
    }

    const value = event.target.innerText; // Get the button's text
    addToStoredValues(value);

    // Reset the touch event flag after a short delay
    setTimeout(() => {
        isTouchEvent = false;
    }, 200);
}

// Event handler for keyboard input
function handleKeyboard(event) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '='];
    const key = event.key;

    if (allowedKeys.includes(key)) {
        addToStoredValues(key);
    }

    // Handle "Enter" key for "="
    if (key === 'Enter') {
        addToStoredValues('=');
    }
}

// Function to add values to the stored array and update the screen
function addToStoredValues(value) {
    storedValues.push(value); // Add the value to the array
    console.log(`Value: ${value}, Stored Values: ${storedValues}`); // Log to console
    screen.innerText = storedValues.join(' '); // Display the array as a space-separated string
}

// Add listeners for both touch and click events to all buttons
document.querySelectorAll('button').forEach((button) => {
    button.addEventListener("click", handleEvent);
    button.addEventListener("touchstart", handleEvent);
});

// Add a listener for keyboard input
document.addEventListener("keydown", handleKeyboard);





// function operate(firstNum, secondNum, operator) {


    

//     function add(firstNum, secondNum) {
//         return firstNum + secondNum
//     }
    
//     function substract(firstNum, secondNum) {
//         return firstNum - secondNum
//     }
    
//     function multiply(firstNum, secondNum) {
//         return firstNum * secondNum
//     }
    
//     function divide(firstNum, secondNum) {
//         return firstNum / secondNum
//     }
    
//     function square(firstNum) {
//         return Math.pow(firstNum, 2)
//     }
    
//     function percentage() {
//         return "not yet emplemented"
//     }
// }

