# Example results

Below are example results from Jev, categorized per state.

## State 1 - Customer inquiry

This is the first object in `states.json` array.
Context: a single text state, where a user is requesting assistance in their Stripe.

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "department": {
      "type": "choice",
      "choice": "technical",
      "confidence": 0.73,
      "probabilities": {
        "sales": 0,
        "billing": 0.18,
        "technical": 0.82
      }
    },
    "frustration": {
      "type": "score",
      "score": 1,
      "confidence": 1,
      "legend": {
        "0": "Calm, just stating facts",
        "1": "Frustrated but civil",
        "2": "Very angry, strong language"
      },
      "probabilities": {
        "0": 0,
        "1": 1,
        "2": 0
      }
    },
    "is_urgent": {
      "type": "noul",
      "noul": 1
    }
  },
  "usage": {
    "input_tokens": 425,
    "output_tokens": 73
  },
  "responseTimeMs": 359.52016599999996
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
department: technical (confidence 0.73)
frustration: Frustrated but civil (score 1, confidence 1)
is_urgent: 100%


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       425 in / 73 out
response:    360 ms
```

---

## State 2 - Playlist creation

This is the second object in `states.json` array.
Context: adding a new musician to an existing music playlist.

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "is_appropriate": {
      "type": "noul",
      "noul": 0.89
    },
    "fit": {
      "type": "score",
      "score": 2.86,
      "confidence": 0.86,
      "legend": {
        "0": "Poor fit: the sound or mood conflicts with the playlist",
        "1": "Partial fit: some elements work, but the overall match is uneven",
        "2": "Strong fit: the sound and mood align well with the playlist",
        "3": "Excellent fit: the band strongly reinforces the playlist's intended experience"
      },
      "probabilities": {
        "0": 0,
        "1": 0,
        "2": 0.14,
        "3": 0.86
      }
    },
    "reason": {
      "type": "choice",
      "choice": "mood",
      "confidence": 0.51,
      "probabilities": {
        "mismatch": 0,
        "mood": 0.63,
        "sound": 0.17,
        "artist_similarity": 0.2
      }
    }
  },
  "usage": {
    "input_tokens": 638,
    "output_tokens": 84
  },
  "responseTimeMs": 402.05825
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
is_appropriate: 89%
fit: Excellent fit: the band strongly reinforces the playlist's intended experience (score 2.86, confidence 0.86)
reason: mood (confidence 0.51)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       638 in / 84 out
response:    402 ms
```

---

## State 3 - MCQ quality

This is the third object in `states.json` array.
Context: an LLM create an MCQ, Jev needs to assess the quality of this MCQ.

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "is_ready": {
      "type": "noul",
      "noul": 0.97
    },
    "quality": {
      "type": "score",
      "score": 2.89,
      "confidence": 0.89,
      "legend": {
        "0": "Unacceptable: incorrect, ambiguous, or missing essential information",
        "1": "Needs revision: mostly usable but has a meaningful correctness, clarity, or explanation problem",
        "2": "Good: correct and clear with only minor possible improvements",
        "3": "Excellent: correct, unambiguous, well-written, and pedagogically useful"
      },
      "probabilities": {
        "0": 0,
        "1": 0,
        "2": 0.11,
        "3": 0.89
      }
    },
    "primary_issue": {
      "type": "choice",
      "choice": "pass",
      "confidence": 0.97,
      "probabilities": {
        "correctness": 0.02,
        "ambiguity": 0,
        "pass": 0.98,
        "explanation": 0,
        "distractors": 0
      }
    }
  },
  "usage": {
    "input_tokens": 691,
    "output_tokens": 91
  },
  "responseTimeMs": 359.9905
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
is_ready: 97%
quality: Excellent: correct, unambiguous, well-written, and pedagogically useful (score 2.89, confidence 0.89)
primary_issue: pass (confidence 0.97)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       691 in / 91 out
response:    360 ms
```

---

## State 4 - Medical emergency

This is the fourth object in `states.json` array.
Context: medical triage decision making

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "needs_immediate_action": {
      "type": "noul",
      "noul": 0.98
    },
    "severity": {
      "type": "score",
      "score": 3,
      "confidence": 1,
      "legend": {
        "0": "Mild: minor symptoms that can be managed at home",
        "1": "Moderate: symptoms that should be seen by a doctor in the coming days",
        "2": "Serious: symptoms that need same-day medical attention",
        "3": "Life-threatening: symptoms that suggest an immediate risk to life or permanent harm"
      },
      "probabilities": {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 1
      }
    },
    "care_level": {
      "type": "choice",
      "choice": "call_emergency",
      "confidence": 1,
      "probabilities": {
        "urgent_care": 0,
        "call_emergency": 1,
        "self_care": 0,
        "gp_visit": 0
      }
    }
  },
  "usage": {
    "input_tokens": 535,
    "output_tokens": 90
  },
  "responseTimeMs": 398.3825
}
```
### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
needs_immediate_action: 98%
severity: Life-threatening: symptoms that suggest an immediate risk to life or permanent harm (score 3, confidence 1)
care_level: call_emergency (confidence 1)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       535 in / 90 out
response:    398 ms
```

---

## State 5 - Content moderation

This is the fifth object in `states.json` array.
Context: user content moderation in an online social media app

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "violates_rules": {
      "type": "noul",
      "noul": 0.96
    },
    "toxicity": {
      "type": "score",
      "score": 1.06,
      "confidence": 0.91,
      "legend": {
        "0": "None: friendly or neutral in tone",
        "1": "Mild: slightly dismissive or condescending, but still civil",
        "2": "Moderate: clearly disrespectful or insulting",
        "3": "Severe: abusive, threatening, or harassing"
      },
      "probabilities": {
        "0": 0.02,
        "1": 0.91,
        "2": 0.07,
        "3": 0
      }
    },
    "violation_type": {
      "type": "choice",
      "choice": "self_promotion",
      "confidence": 1,
      "probabilities": {
        "none": 0,
        "disrespect": 0,
        "self_promotion": 1,
        "health_claims": 0,
        "off_topic": 0
      }
    }
  },
  "usage": {
    "input_tokens": 677,
    "output_tokens": 98
  },
  "responseTimeMs": 342.19320799999997
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
violates_rules: 96%
toxicity: Mild: slightly dismissive or condescending, but still civil (score 1.06, confidence 0.91)
violation_type: self_promotion (confidence 1)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       677 in / 98 out
response:    342 ms
```

---

## State 6 - Resume screening

This is the sixth object in `states.json` array.
Context: Jev makes an assessment on a candidate's resume who's applying for a vacant position.

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "meets_requirements": {
      "type": "noul",
      "noul": 0.5
    },
    "match_strength": {
      "type": "score",
      "score": 1.09,
      "confidence": 0.91,
      "legend": {
        "0": "Weak match: major requirements are missing",
        "1": "Partial match: some requirements are met, but there are significant gaps",
        "2": "Strong match: most requirements are met, with minor gaps",
        "3": "Excellent match: all requirements are met and the background closely fits the role"
      },
      "probabilities": {
        "0": 0,
        "1": 0.91,
        "2": 0.09,
        "3": 0
      }
    },
    "biggest_gap": {
      "type": "choice",
      "choice": "domain",
      "confidence": 0.96,
      "probabilities": {
        "experience": 0,
        "none": 0,
        "skills": 0.02,
        "seniority": 0.01,
        "domain": 0.97
      }
    }
  },
  "usage": {
    "input_tokens": 650,
    "output_tokens": 90
  },
  "responseTimeMs": 360.001583
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
meets_requirements: 50%
match_strength: Partial match: some requirements are met, but there are significant gaps (score 1.09, confidence 0.91)
biggest_gap: domain (confidence 0.96)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       650 in / 90 out
response:    360 ms
```

---

## State 7 - Email screening

This is the seventh object in `states.json` array.
Context: Jev (as an n8n node) decides whether an email is worth sending a notification via Telegram for.

### Response log

```
{
  "model": "jev-1.13.0",
  "answers": {
    "notify": {
      "type": "noul",
      "noul": 0.06
    },
    "category": {
      "type": "choice",
      "choice": "marketing_promo",
      "confidence": 1,
      "probabilities": {
        "business_inquiry": 0,
        "other": 0,
        "marketing_promo": 1,
        "customer": 0,
        "automated_notification": 0
      }
    },
    "promotional_likelihood": {
      "type": "score",
      "score": 2.91,
      "confidence": 0.91,
      "legend": {
        "0": "Clearly personal or transactional, tied to a specific existing relationship or request",
        "1": "Probably genuine, but with some generic or promotional elements",
        "2": "Probably promotional, with generic wording or a templated sales pitch",
        "3": "Clearly promotional or bulk marketing"
      },
      "probabilities": {
        "0": 0,
        "1": 0,
        "2": 0.09,
        "3": 0.91
      }
    }
  },
  "usage": {
    "input_tokens": 727,
    "output_tokens": 97
  },
  "responseTimeMs": 357.612958
}
```

### Print out

```
= = = = = = = = = = = = =
Jev's Response
- - - - - - - - - - - - -
notify: 6%
category: marketing_promo (confidence 1)
promotional_likelihood: Clearly promotional or bulk marketing (score 2.91, confidence 0.91)


= = = = = = = = = = = = =
System Information
- - - - - - - - - - - - -
model:       jev-1.13.0
usage:       727 in / 97 out
response:    358 ms
```
