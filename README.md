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

The JavaScript example uses Node's built-in `fetch` and `dotenv`.

From the repository root:

```sh
cd javascript-via-API
npm install
node jev-cli.js
```

The JavaScript example analyzes the first state in `states.json`.

```sh
node jev-cli.js
```

## Python

Create the virtual environment and install the SDK dependencies:

```sh
cd python-via-SDK
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Run the first state in `states.json`:

```sh
.venv/bin/python jev_cli.py
```

Select a different state with its zero-based index:

```sh
.venv/bin/python jev_cli.py 1
```

The state index defaults to `0`. Add more state objects to the root
`states.json` file to make additional indices available.
