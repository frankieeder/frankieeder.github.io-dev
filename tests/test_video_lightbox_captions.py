"""Regression test: video lightbox caption populates from source tile."""
import pytest
from playwright.sync_api import Page


VIEWPORT = (1280, 720)


def test_video_lightbox_populates_caption_from_source_tile(
    page: Page, server_url: str
):
    """Lightbox caption reflects the source tile's `.content-text-element`s."""
    page.set_viewport_size({"width": VIEWPORT[0], "height": VIEWPORT[1]})
    page.goto(server_url)
    page.wait_for_selector(".video-overlay", timeout=10_000)

    candidate = page.locator(
        ".content:has(.video-overlay):has(.content-text-element)"
    ).first
    if candidate.count() == 0:
        pytest.skip("no .content card with both .video-overlay and .content-text-element")

    expected_texts = [
        t.strip()
        for t in candidate.locator(".content-text-element").all_text_contents()
        if t.strip()
    ]
    if not expected_texts:
        pytest.skip("first eligible tile has no non-empty text elements")

    candidate.locator(".video-overlay").first.click()
    page.wait_for_selector(".lightbox.visible", timeout=5_000)
    page.wait_for_function(
        "document.getElementById('lightbox-video-container').offsetHeight > 0",
        timeout=5_000,
    )

    caption_block = page.locator(".lightbox-caption-container").inner_text().strip()
    assert caption_block, f"caption empty; expected one of: {expected_texts!r}"
    matched = [t for t in expected_texts if t in caption_block]
    assert matched, (
        f"none of {expected_texts!r} appear in caption {caption_block!r}"
    )
