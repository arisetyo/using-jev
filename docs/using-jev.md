# Using Jev: designing states and reading its answers

## Part 1: What Jev is

### A different kind of model

Most people meet language models as text generators: you send a prompt, you get prose back, and then you write code to parse that prose. **Jev** is TypeSafe's first **System One** model, and it works differently. You give it some *state* (any text or JSON describing a situation) and a set of *questions*. It returns **typed answers with probabilities**. It does not generate text and it does not explain its reasoning.

"System One" borrows from the idea of fast, intuitive thinking: quick judgments that need no deliberation. A System One model supplies *programmable common sense*. Ordinary code is good at arithmetic, lookups and rules, but it cannot tell whether an email is a sales pitch dressed up as a personal note. Jev can, and it hands you the answer as a number or a label that your code can branch on. The workflow stays in your code, and the model only supplies the semantic judgment.

### Three kinds of answer

Every question you ask is one of three primitives:

| Primitive | Use it for | What comes back |
| --- | --- | --- |
| `choice` | Picking one option from a defined set | The chosen option, a probability for every option, and a confidence |
| `score` | A degree along an ordered scale | A probability-weighted score, a probability for every level, and a confidence |
| `noul` | Whether a condition holds | A single probability that the answer is yes |

Because answers are typed, the response can go straight into an `if` statement, a database column, a sort key or an n8n branch.

### Why this matters

- **It is fast and cheap.** In the example runs in this workspace, every call returned in roughly 340–400 ms and used 425–727 input tokens and 73–98 output tokens.
- **It gives calibrated probabilities, not just labels.** You decide where to draw the line, and that line can differ by use case.
- **One call can carry several judgments.** Independent questions over the same state run together, so you can ask for a routing decision, a severity grade and a yes/no gate in a single request.
- **It composes.** The judgments are reusable data. You can re-weight them, threshold them or log them without calling the model again.

Calling the API (or the Python SDK) is a few lines of code and is not the interesting part. The rest of this article is about the two things that decide whether Jev is useful: **how you write the state and questions**, and **how you interpret what comes back**.

---

## Part 2: The example states

The workspace holds seven examples in [`states.json`](../states.json). Each is an object with a `state` and a set of `questions`. The CLI in [`javascript-via-API/jev-cli.js`](../javascript-via-API/jev-cli.js) sends one of them to Jev and prints the answers. Real responses are recorded in [`example_results.md`](./example_results.md).

### Reading the response: a short guide

The same rules apply to every example below.

- **`noul`** is a probability from 0 to 1 that the condition is true. The CLI prints it as a percentage. A value near 0 or 1 is a decisive answer. A value near **0.5** means Jev sees yes and no as about equally likely. It does not mean "medium yes".
- **`score`** returns the expected position on your scale. If the probabilities are `{2: 0.14, 3: 0.86}`, the score is 0.14×2 + 0.86×3 = **2.86**. A fractional score therefore tells you which side of a level the answer leans toward. The `probabilities` object shows how that score was built, and `confidence` shows how concentrated it is.
- **`choice`** returns the winning option plus a probability for each option. `confidence` summarizes how concentrated the distribution is. It is *not* the same as the winning option's probability. In Example 1, `technical` has probability 0.82 but confidence 0.73.
- **Confidence is not correctness.** A confident answer means the distribution is sharply peaked. It does not mean the answer is right. Validate against your own data before you act on a threshold.
- **Low confidence is not always a problem.** If several answers are acceptable (a band can fit a playlist because of its mood *and* its sound), spread-out probability is expected.

Questions are written in `instructions` and `criteria`. The question IDs (`department`, `fit` and so on) are only for your code and are never shown to the model, so everything the model needs must be in the instruction and criteria text.

---

### Example 1: Customer support triage

**Shape:** a plain string as state, three questions of three different types.

```json
"state": "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP."
```

| Question | Type | Purpose |
| --- | --- | --- |
| `department` | choice | Route to `billing`, `technical` or `sales` |
| `frustration` | score | Rate the customer's emotional temperature, 0–2 |
| `is_urgent` | noul | Does the message convey time pressure? |

**What came back:** `technical` (probability 0.82, confidence 0.73), frustration 1 ("Frustrated but civil", probability 1.0), urgency 100%.

**Design notes:**
- A string is enough when the state is a single message. No structure is needed.
- The three questions are *independent dimensions* of the same text. Splitting them keeps each judgment narrow, and each can be used on its own. You might route on `department`, escalate on `frustration`, and set a ticket's priority from `is_urgent`.
- Note the 0.18 probability on `billing`. The customer mentions lost sales, which is money-adjacent. If you auto-route, a rule like "send to `technical`, but copy `billing` if its probability is above 0.15" is easy to express because the full distribution is available.

---

### Example 2: Playlist fit

**Shape:** a structured object with two related entities (a `band` and a `playlist`).

**What it is testing:** comparing two things against each other, rather than classifying one thing.

| Question | Type | Purpose |
| --- | --- | --- |
| `is_appropriate` | noul | Should the band be added? |
| `fit` | score | How well does the sound fit, 0–3? |
| `reason` | choice | The main reason: `mood`, `sound`, `artist_similarity` or `mismatch` |

**What came back:** `is_appropriate` 89%, `fit` 2.86 (86% on "Excellent"), and `reason` = `mood` at only 0.51 confidence.

**Design notes:**
- Naming the fields (`band.sound`, `playlist.desired_mood`, `playlist.existing_artists`) gives the model the same structure you would use in code. Prefer named JSON fields over a single paragraph when the context has several parts.
- Notice how the three answers differ in what they tell you. The noul and score agree that this is a good fit. The `reason` choice is deliberately soft: mood had 0.63, artist similarity 0.20 and sound 0.17. All three are valid reasons, so the spread is correct, and you would not gate anything on this answer. You would show it as an explanation, or ignore it.
- Including a `mismatch` choice is a good habit: it gives the model an outlet when nothing else fits.

**Where it applies:** recommendation and curation systems, "does this item belong in this collection" checks, and content tagging.

---

### Example 3: Quality control for generated content

**Shape:** a structured object (question, options, correct answer, explanation) judged as a whole.

**What it is testing:** Jev as a *checker* for another model's output. An LLM writes a multiple-choice question and Jev decides whether it is fit to show.

| Question | Type | Purpose |
| --- | --- | --- |
| `is_ready` | noul | Is the item good enough to publish? |
| `quality` | score | Overall quality, 0–3 |
| `primary_issue` | choice | `pass`, `correctness`, `ambiguity`, `distractors` or `explanation` |

**What came back:** `is_ready` 97%, `quality` 2.89, `primary_issue` = `pass` at 0.98 probability.

**Design notes:**
- The `is_ready` instruction spells out *what "ready" means* (factually correct, one clearly best answer, plausible distractors, a supporting explanation). Putting that definition in the instruction is what makes the judgment reliable. A bare "is this good?" would not be.
- `primary_issue` is useful even when everything passes. When an item fails, it tells the pipeline *why*, so you can send it back to the generator with a targeted instruction ("fix the distractors") instead of regenerating blindly.
- This pattern generalizes to any generate-then-verify loop: summaries, translations, product descriptions, support replies. Generate with an LLM, then check with Jev. Retry or escalate when `is_ready` is low.

---

### Example 4: Medical triage

**Shape:** free text from a worried family member describing symptoms of a possible stroke.

> **Note:** this is a demonstration of the pattern, not a medical device. A real triage system needs clinical validation and human oversight.

| Question | Type | Purpose |
| --- | --- | --- |
| `needs_immediate_action` | noul | Do we need to call emergency services now? |
| `severity` | score | Mild (0) to life-threatening (3) |
| `care_level` | choice | `call_emergency`, `urgent_care`, `gp_visit` or `self_care` |

**What came back:** 98% immediate action, severity 3 with probability 1.0, and `call_emergency` with probability 1.0.

**Design notes:**
- The text contains a misleading signal: the patient says he is "fine and just tired". The facts (facial droop, slurred speech, arm weakness, sudden onset) outweigh that, and all three answers agree. When several differently-shaped questions give consistent answers, that is stronger evidence than any one of them.
- **Asymmetric thresholds** are the key idea here. Because missing an emergency is far worse than a false alarm, you would alert on `needs_immediate_action` at a *low* threshold (say 0.3) and accept more false positives. The probability lets you tune this deliberately instead of accepting a hard yes/no.
- Deciding the cut-offs is your job. Choose them from your own labeled cases and the cost of each kind of error.

---

### Example 5: Content moderation

**Shape:** a structured object with community rules, thread context and the comment being judged.

**What it is testing:** context-dependent policy. The same sentence can be fine in one community and a violation in another, so the rules travel with the state.

| Question | Type | Purpose |
| --- | --- | --- |
| `violates_rules` | noul | Does the comment break any rule? |
| `toxicity` | score | Hostility, 0 (none) to 3 (severe) |
| `violation_type` | choice | `none`, `disrespect`, `self_promotion`, `health_claims` or `off_topic` |

**What came back:** `violates_rules` 96%, toxicity 1.06 ("Mild"), `violation_type` = `self_promotion` with probability 1.0.

**Design notes:**
- The comment mixes helpful advice, a product plug and a condescending jab. Jev's reading is sensible: the *clear* violation is self-promotion, while the jab is only mildly toxic and civil enough not to count as the main problem.
- Separating `violates_rules` (a policy judgment) from `toxicity` (a tone judgment) matters. A comment can break a rule while being perfectly polite, as this one largely is. A single "is this bad?" question would blur the two.
- Policy stays in your code. You might auto-remove at `violates_rules > 0.9` and `toxicity >= 2`, and send everything else in the grey zone to a human moderator. Changing that policy later does not require re-running Jev, because you stored the raw judgments.
- Putting the community's rules in the state is what lets the same questions work across many communities.

---

### Example 6: Resume screening

**Shape:** a structured object with a `job` (required skills, minimum experience, domain) and a `candidate` summary.

| Question | Type | Purpose |
| --- | --- | --- |
| `meets_requirements` | noul | Should this candidate be interviewed? |
| `match_strength` | score | Weak (0) to excellent (3) |
| `biggest_gap` | choice | `none`, `skills`, `experience`, `seniority` or `domain` |

**What came back:** `meets_requirements` **50%**, `match_strength` 1.09 ("Partial match"), `biggest_gap` = `domain` at 0.97 probability.

**Design notes:**
- This is the most instructive result because the answer is genuinely mixed. The candidate has the right skills and years of experience but no payments background. Jev reflects that: the score is firmly "partial", the gap is clearly the domain, and the yes/no gate sits at exactly **0.5**.
- A 0.5 here is information. It says "this is a judgment call" and it is the right thing to route to a human. A system that must output yes or no would have hidden this uncertainty.
- `biggest_gap` is what makes the result actionable. A recruiter learns *what to probe* in an interview.
- Treat this kind of use with care. Hiring decisions affect people, so keep a human in the loop, and test for bias on your own data before relying on automated screening.

---

### Example 7: Email gate (n8n)

**Shape:** a structured object with a one-line `business` description and an `email` (from, subject, body).

**The problem:** an n8n flow sends a Telegram message for every email the business receives, with no filter. The goal is to notify only for customers and legitimate business inquiries, and stay quiet for third-party marketing.

| Question | Type | Purpose |
| --- | --- | --- |
| `notify` | noul | The gate: is this worth an alert? |
| `category` | choice | `customer`, `business_inquiry`, `marketing_promo`, `automated_notification` or `other` |
| `promotional_likelihood` | score | Personal (0) to clearly bulk marketing (3) |

**What came back:** `notify` **6%**, `category` = `marketing_promo` with probability 1.0, and `promotional_likelihood` 2.91.

**Design notes:**
- The test email is a hard case: a cold sales pitch written to sound like a personal inquiry ("I came across your company and was impressed by your work in health informatics"). A keyword filter would struggle with it. Jev gets it right with a very low `notify` score.
- The `business` field is important. Without it, the model cannot tell whether "your clinical data platform" is a real interest or boilerplate.
- In n8n, the gate is a single condition: `notify >= 0.5` (or a threshold you choose) goes to Telegram. Everything else is dropped or filed. Log `category` and `promotional_likelihood` alongside it so you can audit the decisions and tune the threshold.
- The gate is asymmetric: a missed customer email costs more than an extra alert. A lower threshold (for example, 0.3) errs on the side of notifying. Test it on a few weeks of real mail before you trust it. Also add a *positive* test, such as a real customer or research collaborator, to confirm the gate lets legitimate mail through.

---

### Patterns across the examples

| Pattern | Seen in |
| --- | --- |
| **Route** a request to the right handler | 1, 7 |
| **Grade** along a described dimension | 1, 2, 3, 4, 5, 6, 7 |
| **Gate** with a yes/no probability | every example |
| **Compare** two entities | 2, 6 |
| **Verify** another system's output | 3 |
| **Apply policy** supplied in the state | 5 |
| **Explain** a decision with a `choice` reason | 2, 3, 5, 6, 7 |

Almost every example uses the same trio: a `noul` as the gate, a `score` for the degree, and a `choice` for the reason. You can reuse that trio for new problems.

### Writing good states and questions

These lessons come from the examples above:

1. **Give the model what a person would need.** Include the source text, identities, relationships, rules and current facts. The business description in Example 7 and the community rules in Example 5 are what make those judgments possible.
2. **Use named fields when the context has several parts.** Reserve plain strings for a single message.
3. **Ask one narrow judgment per question.** Split dimensions that are independently useful, as with `violates_rules` and `toxicity`.
4. **Put the full meaning in `instructions` and `criteria`.** The question ID is never seen by the model.
5. **Make score levels concrete.** Each level should describe a recognizable situation that stands on its own, as in "Clearly promotional or bulk marketing".
6. **Include a no-match option** (`none`, `pass`, `other`, `mismatch`) wherever nothing might fit.
7. **Define "ready", "appropriate" and "urgent".** A noul instruction that spells out the conditions (Example 3) is more reliable than a vague one.
8. **Ask independent questions together.** They run in parallel and cannot see one another's answers, so a single request can carry the gate, the degree and the reason.

---

## Part 3: Jev in your system

Each example above is a small judgment that ordinary code struggled to make. That is where Jev fits best. Jev does not replace your application logic. It sits next to the logic and answers the questions that need common sense.

### Decision-making software

Triage, screening, approval and routing systems all run on judgments. Jev turns messy input into the probabilities these systems need (Examples 1, 4 and 6). Three properties matter most:

- **Uncertainty is visible.** A 0.5 on a resume or a spread-out distribution on a ticket tells the system to ask for help instead of guessing.
- **Thresholds are yours.** Set them per decision, based on the cost of each kind of error.
- **The raw judgments are reusable.** Store them, then change weights and policies later without re-running inference.

### Social media and community apps

Moderation, feed ranking and content tagging all depend on contextual interpretation (Examples 2 and 5). Because policy travels in the state, one set of questions can serve many communities with different rules. Scores can feed ranking directly, and a `choice` can label a post with its reason for the user or the moderator.

### LLM-powered systems

Jev pairs naturally with generative models (Example 3):

- **As a verifier:** let an LLM generate, then have Jev check the result before it reaches a user.
- **As a router:** classify the request first, so only the hard cases go to a larger, slower reasoning model.
- **As an escalation trigger:** use a low confidence or a mid-range probability to decide when to bring in a person or a stronger model.

Jev is fast and returns structured output, so it can sit in the middle of an agent loop without adding much latency or parsing code.

### n8n and other workflow tools

Example 7 shows the simplest integration: an HTTP call returning a number that a downstream node can compare. Any workflow that currently fires "for every item" can gain a gate: new emails, form submissions, support tickets, social mentions, uploaded documents. Add the answers to the item's data and branch on them. Log the categories too, so the flow explains its own decisions.

### Closing advice

- **Keep rules and calculations in code.** Use Jev for the judgments that need meaning.
- **Treat the output as a calibrated opinion.** It guarantees the *shape* of the answer, not its truth.
- **Test on real examples.** Pick representative cases, including the hard and adversarial ones, check what actually happens at your thresholds, and revisit them as your data changes.
- **Start small.** One gate with one threshold (like the email filter) is a useful first project. From there, add questions that make each decision richer.
