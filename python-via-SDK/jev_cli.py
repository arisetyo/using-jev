#!/usr/bin/env python3
"""Run Jev against the first state in the repository's states.json file."""

import json
from pathlib import Path

from dotenv import load_dotenv
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

root = Path(__file__).resolve().parent.parent
load_dotenv(root / ".env")

with (root / "states.json").open(encoding="utf-8") as file:
    state_config = json.load(file)[0]

with TypeSafeClient() as client:
    response = client.system_one(
        state=state_config["state"],
        questions={
            "department": Choice(**state_config["questions"]["department"]),
            "frustration": Score(**state_config["questions"]["frustration"]),
            "is_urgent": Noul(**state_config["questions"]["is_urgent"]),
        },
    )

dept = response.choices["department"]
print(f"department:  {dept.choice} (confidence {dept.confidence})")
print(f"frustration: {response.scores['frustration'].score}")
print(f"is_urgent:   {response.nouls['is_urgent'].noul}")
