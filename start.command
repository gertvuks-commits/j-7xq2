#!/bin/bash
# Double-click this file to start J.A.R.V.I.S in the browser.
# Leave this window open while you use it. Press Ctrl+C to stop.

set -e
cd "$(cd "$(dirname "$0")" && pwd)"

find_python() {
  local candidate
  for candidate in \
    python3 \
    /usr/local/bin/python3 \
    /Library/Frameworks/Python.framework/Versions/3.14/bin/python3 \
    /Library/Frameworks/Python.framework/Versions/Current/bin/python3
  do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

if ! PYTHON="$(find_python)"; then
  echo "Python 3 is required."
  echo "Install it from https://www.python.org/downloads/macos/"
  echo "Choose the macOS 64-bit universal2 installer, then run this file again."
  echo
  read -r -p "Press Enter to close…"
  exit 1
fi

port_is_up() {
  local port="$1"
  "$PYTHON" -c "import socket,sys
s=socket.socket()
s.settimeout(0.4)
try:
    raise SystemExit(0 if s.connect_ex(('127.0.0.1', int(sys.argv[1])))==0 else 1)
finally:
    s.close()" "$port"
}

PORT=""
for try_port in 8000 8001 8002 8003 8004 8010; do
  if port_is_up "$try_port"; then
    if curl -sf "http://127.0.0.1:${try_port}/index.html" >/dev/null 2>&1; then
      PORT="$try_port"
      echo "Already running at http://localhost:${PORT}/"
      break
    fi
    continue
  fi
  PORT="$try_port"
  break
done

if [ -z "$PORT" ]; then
  echo "Could not find a free port in 8000–8010."
  read -r -p "Press Enter to close…"
  exit 1
fi

URL="http://localhost:${PORT}/"
STARTED_SERVER=0
SERVER_PID=""

if ! port_is_up "$PORT"; then
  echo "Starting J.A.R.V.I.S at ${URL}"
  "$PYTHON" -m http.server "$PORT" --bind 127.0.0.1 &
  SERVER_PID=$!
  STARTED_SERVER=1
  trap 'if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null; fi' EXIT INT TERM
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if port_is_up "$PORT"; then
      break
    fi
    sleep 0.2
  done
fi

open_browser() {
  if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" "$URL"
  elif [ -d "/Applications/Chromium.app" ]; then
    open -a "Chromium" "$URL"
  else
    open "$URL"
  fi
}

open_browser
echo
echo "J.A.R.V.I.S is open at ${URL}"
echo "Allow the microphone when Chrome asks."
echo "Leave this window open. Press Ctrl+C to stop the local page server."
echo

if [ "$STARTED_SERVER" -eq 1 ]; then
  wait "$SERVER_PID"
else
  read -r -p "Press Enter to close this window…"
fi
