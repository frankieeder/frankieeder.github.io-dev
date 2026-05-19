"""Smoke test for the e2e infra: homepage renders at least one .content card."""
from playwright.sync_api import Page


def test_homepage_renders(page: Page, server_url: str):
    page.goto(server_url)
    # state="attached" avoids racing the #contents_wrapper fade-in animation.
    page.wait_for_selector(".content", state="attached", timeout=10_000)
