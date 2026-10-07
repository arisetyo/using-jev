#!/usr/bin/env node
// Usage: node --env-file=../.env jev-cli.js "message text"

const apiKey = process.env.TYPESAFE_API_KEY;
if (!apiKey) {
  console.error("TYPESAFE_API_KEY is not set");
  process.exit(1);
}

const state =
  process.argv.slice(2).join(" ") ||
  "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP.";

const res = await fetch("https://api.typesafe.ai/v1/systemone", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    state,
    model: "jev-latest",
    questions: {
      department: {
        type: "choice",
        instructions: "Which team should handle this",
        criteria: {
          billing: "Payment or subscription issues",
          technical: "Bugs or integration problems",
          sales: "Pricing or account questions",
        },
      },
      frustration: {
        type: "score",
        instructions: "How frustrated the customer appears",
        criteria: [
          "Calm, just stating facts",
          "Frustrated but civil",
          "Very angry, strong language",
        ],
      },
      is_urgent: {
        type: "noul",
        instructions: "The message conveys urgency or time-sensitivity",
      },
    },
  }),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const { model, answers, usage } = await res.json();
console.log(`model:       ${model}`);
console.log(`department:  ${answers.department.choice} (confidence ${answers.department.confidence})`);
console.log(`frustration: ${answers.frustration.score}`);
console.log(`is_urgent:   ${answers.is_urgent.noul}`);
console.log(`usage:       ${usage.input_tokens} in / ${usage.output_tokens} out`);
