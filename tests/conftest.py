"""Pytest fixtures for the lightbox end-to-end tests.

Spins up `python3 -m http.server` in a background thread serving the repo
root, so tests can hit a real localhost URL without depending on
Cloudflare previews or external services.  The fixture is session-scoped:
the server starts once for the whole pytest run and tears down at exit.
"""
import http.server
import socketserver
import threading
from functools import partial
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parents[1]


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler that doesn't spam stderr with request logs."""

    def log_message(self, format, *args):  # noqa: A002 (signature is fixed)
        pass


@pytest.fixture(scope="session")
def server_url():
    """Serve the repo root over HTTP for the duration of the test session.

    Binds to port 0 so the OS picks a free port — avoids clashes with the
    user's `make run` server or with parallel test runs in CI.
    """
    handler = partial(_QuietHandler, directory=str(REPO_ROOT))
    # allow_reuse_address makes flaky teardown less painful in dev.
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]

    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=2)
