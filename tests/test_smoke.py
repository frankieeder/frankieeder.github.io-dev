"""Smoke test for the e2e test infrastructure itself.

Confirms three things that every more-specific test depends on:

1. The session-scoped `server_url` fixture from conftest.py is serving
   the repo root over HTTP.
2. Playwright can launch headless Chromium and reach that URL.
3. The page actually renders (i.e. mustache templates load, content.js
   evaluates, and at least one `.content` card appears in the DOM).

If this test fails, no other e2e test in this repo is meaningful — fix
this first.  Kept deliberately content-agnostic so it doesn't break when
the homepage layout or copy changes.
"""
from playwright.sync_api import Page


def test_homepage_renders(page: Page, server_url: str):
    page.goto(server_url)
    # Mustache templates are fetched after page load, then content cards
    # are interpolated into #contents.  Wait for at least one to appear
    # in the DOM.
    #
    # Use state="attached" instead of the default "visible": the smoke
    # test only cares that mustache rendered content cards, not that the
    # `#contents_wrapper.fade-in-delayed` opacity animation has
    # completed.  The fade-in keeps opacity at 0 for the first ~9s of
    # its 10s lifetime, which makes visible-state checks flaky on cold-
    # start runs.
    page.wait_for_selector(".content", state="attached", timeout=10_000)
