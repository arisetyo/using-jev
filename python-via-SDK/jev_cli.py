#!/usr/bin/env python3
"""Usage: python jev_cli.py "message text" """

import sys
from pathlib import Path

from dotenv import load_dotenv
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

state = " ".join(sys.argv[1:]) or (
    "Hi, I've been trying to connect my Stripe account for 3 days and the "
    "integration keeps failing. I'm losing sales. Please help ASAP."
)

with TypeSafeClient() as client:
    response = client.system_one(
        state=state,
        questions={
            "department": Choice(
                instructions="Which team should handle this",
                criteria={
                    "billing": "Payment or subscription issues",
                    "technical": "Bugs or integration problems",
                    "sales": "Pricing or account questions",
                },
            ),
            "frustration": Score(
                instructions="How frustrated the customer appears",
                criteria=[
                    "Calm, just stating facts",
                    "Frustrated but civil",
                    "Very angry, strong language",
                ],
            ),
            "is_urgent": Noul(
                instructions="The message conveys urgency or time-sensitivity",
            ),
        },
    )

dept = response.choices["department"]
print(f"department:  {dept.choice} (confidence {dept.confidence})")
print(f"frustration: {response.scores['frustration'].score}")
print(f"is_urgent:   {response.nouls['is_urgent'].noul}")
