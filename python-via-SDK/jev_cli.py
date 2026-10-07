#!/usr/bin/env python3
"""Run Jev against a selected state in the repository's states.json file."""

import argparse
import json
import time
from pathlib import Path

from dotenv import load_dotenv
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

root = Path(__file__).resolve().parent.parent
load_dotenv(root / ".env")

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "state_index",
    nargs="?",
    type=int,
    default=0,
    help="zero-based index of the state to analyze (default: 0)",
)
args = parser.parse_args()

with (root / "states.json").open(encoding="utf-8") as file:
    states = json.load(file)

if not 0 <= args.state_index < len(states):
    parser.error(
        f"state_index must be between 0 and {len(states) - 1}; "
        f"received {args.state_index}"
    )

state_config = states[args.state_index]

stopwatch_start = time.perf_counter()

with TypeSafeClient() as client:
    response = client.system_one(
        state=state_config["state"],
        questions={
            name: {
                "choice": Choice,
                "score": Score,
                "noul": Noul,
            }[question["type"]](
                instructions=question["instructions"],
                **({"criteria": question["criteria"]} if "criteria" in question else {}),
            )
            for name, question in state_config["questions"].items()
        },
    )

response_time_ms = (time.perf_counter() - stopwatch_start) * 1000

for name, question in state_config["questions"].items():
    if question["type"] == "choice":
        answer = response.choices[name]
        print(f"{name}: {answer.choice} (confidence {answer.confidence})")
    elif question["type"] == "score":
        print(f"{name}: {response.scores[name].score}")
    else:
        print(f"{name}: {response.nouls[name].noul}")
print(f"response:    {response_time_ms:.0f} ms")
