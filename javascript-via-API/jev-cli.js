#!/usr/bin/env node
// Usage: node jev-cli.js "message text"

import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve("../.env") });

// Load the states from the JSON file
const states = JSON.parse(fs.readFileSync("../states.json", "utf-8"));

// Load environment variables from .env file
const apiKey = process.env.TYPESAFE_API_KEY;
if (!apiKey) {
  console.error("TYPESAFE_API_KEY is not set");
  process.exit(1);
}
// API URL
const apiUrl = process.env.TYPESAFE_URL;
if (!apiUrl) {
  console.error("TYPESAFE_URL is not set");
  process.exit(1);
}

// use CLI argument to select the state index
let SELECTED_STATE_INDEX = parseInt(process.argv[2], 10) || 0;
if (SELECTED_STATE_INDEX < 0 || SELECTED_STATE_INDEX >= states.length) {
  console.warn(`Invalid state index provided. Defaulting to 0.`);
}

/**
 * State
 * 
 * In Jev, the state represents the current context or message being processed.
 * It is used to maintain the conversation context and track user interactions.
 * It is essential for generating context-aware responses from the model.
 */
const state = states[SELECTED_STATE_INDEX].state;

/**
 * The `questions` node contains the specific queries to ask the model about the current state.
 * Inside this node we can ask several specific questions about the current state.
 * The nodes within the `questions` object define the specific questions to ask the model, along with their types, instructions, and criteria.
 * We can name each question node according to its purpose.
 * In this instance, we are asking about which department should handle the message, the frustration level of the state, and urgency of the message in the state.
 */
const questions = states[SELECTED_STATE_INDEX].questions;

// Prepare the request body for the API call, including the current state, model, and questions.
const requestBody = {
  state,
  model: "jev-latest",
  questions,
};

const stopwatchStart = performance.now();

/**
 * API Request
 * This section sends the current state to the Jev API and retrieves the model's response.
 */
const res = await fetch(apiUrl, {
  body: JSON.stringify(requestBody),
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

// Parse the JSON response from the API and extract the model, answers, and usage information.
const { model, answers, usage } = await res.json();
const responseTimeMs = performance.now() - stopwatchStart;

// write the res.json() to response.log for debugging purposes
fs.writeFileSync(
  "response.log",
  JSON.stringify({ model, answers, usage, responseTimeMs }, null, 2),
);

// Print the model's response to the console for easy viewing

console.log("= = = = = = = = = = = = =");
console.log("Jev's Response");
console.log("- - - - - - - - - - - - -");
for (const [name, question] of Object.entries(questions)) {
  const answer = answers[name];
  if (question.type === "noul") {
    console.log(`${name}: ${(answer.noul * 100).toFixed(0)}%`);
  } else if (question.type === "score") {
    const [scoreIndex] = Object.entries(answer.probabilities).reduce(
      (best, current) => (current[1] > best[1] ? current : best),
    );
    console.log(
      `${name}: ${answer.legend[scoreIndex]} ` +
        `(score ${answer.score}, confidence ${answer.confidence})`,
    );
  } else {
    console.log(`${name}: ${answer.choice} (confidence ${answer.confidence})`);
  }
}
console.log("\n");
console.log("= = = = = = = = = = = = =");
console.log("System Information");
console.log("- - - - - - - - - - - - -");
console.log(`model:       ${model}`);
console.log(`usage:       ${usage.input_tokens} in / ${usage.output_tokens} out`);
console.log(`response:    ${responseTimeMs.toFixed(0)} ms`);
console.log("\n");