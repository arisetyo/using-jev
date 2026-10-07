# Jev examples

Two small TypeSafe Jev examples are included:

- [`javascript-via-API/jev-cli.js`](./javascript-via-API/jev-cli.js) uses the
  TypeSafe HTTP API directly.
- [`python-via-SDK/jev_cli.py`](./python-via-SDK/jev_cli.py) uses the TypeSafe
  Python SDK.

## Prerequisites

- Node.js 20 or newer
- Python 3.10 or newer
- A TypeSafe API key in the root `.env` file:

  ```dotenv
  TYPESAFE_API_KEY=your_api_key
  ```

Keep `.env` private and do not commit the API key.

## JavaScript

The JavaScript example uses Node's built-in `fetch` and `--env-file`; no npm
dependencies are required.

From the repository root:

```sh
cd javascript-via-API
node --env-file=../.env jev-cli.js
```

Pass a custom message as a quoted argument:

```sh
node --env-file=../.env jev-cli.js "I was charged twice for my subscription."
```

## Python

Create the virtual environment and install the SDK dependencies:

```sh
cd python-via-SDK
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Run the example:

```sh
.venv/bin/python jev_cli.py
```

Pass a custom message as a quoted argument:

```sh
.venv/bin/python jev_cli.py "I was charged twice for my subscription."
```
