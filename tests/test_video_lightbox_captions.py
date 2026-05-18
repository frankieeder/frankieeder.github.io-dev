"""Regression test for caption population in the video lightbox.

When a user clicks a video tile, the lightbox should pull title /
subtitle / subheader / subsubtitle / credits from the surrounding
`.content` card's `.content-text-element` children — the same pattern
the image lightbox uses via `populateLightboxText()`.

On `frankieeder-com/new-layout`, `openVideoLightBox()` only sets
`#lightbox-title` if its `caption` argument is truthy.  Every mustache
template that invokes it passes `''` as that argument, so video
captions never populate.  Photo captions still work (image lightbox
walks up to `.content` and calls `populateLightboxText` itself).

PR #27 fixes the video path by adding the same walk-and-populate
sequence.  This test pins the contract; the `xfail` mark comes off once
#27 is merged into the goal branch.

### Why one test, not a parametrize matrix

The bug is binary: either openVideoLightBox calls populateLightboxText
or it doesn't.  One test on the first eligible tile is enough signal.
The aspect-ratio matrix lives in `test_video_lightbox_aspect_ratios.py`
(PR #32); the viewport matrix lives in `test_video_lightbox.py`
(PR #31).  This file is just for the caption contract.
"""
import pytest
from playwright.sync_api import Page


VIEWPORT = (1280, 720)


@pytest.mark.xfail(
    reason="openVideoLightBox() on frankieeder-com/new-layout doesn't call "
           "populateLightboxText, so video lightbox captions are always empty. "
           "Fixed in PR #27; remove this xfail once #27 merges into the goal "
           "branch (or this branch rebases on top of #27).",
    strict=False,
)
def test_video_lightbox_populates_caption_from_source_tile(
    page: Page, server_url: str
):
    """The lightbox caption block should reflect the source tile's text.

    Picks the first `.content` card that has both a `.video-overlay`
    (clickable, non-thumbnail video) and at least one
    `.content-text-element` (title / subtitle / etc.).  Captures the
    expected text from the DOM so the assertion stays correct as
    `content.js` drifts.
    """
    page.set_viewport_size({"width": VIEWPORT[0], "height": VIEWPORT[1]})
    page.goto(server_url)
    page.wait_for_selector(".video-overlay", timeout=10_000)

    candidate = page.locator(
        ".content:has(.video-overlay):has(.content-text-element)"
    ).first
    if candidate.count() == 0:
        pytest.skip(
            "no .content card with both a .video-overlay and a "
            ".content-text-element found — update content.js or this test"
        )

    # Snapshot the text fields on the source tile before clicking.
    expected_texts = [
        t.strip()
        for t in candidate.locator(".content-text-element").all_text_contents()
        if t.strip()
    ]
    if not expected_texts:
        pytest.skip(
            "first eligible video tile has no non-empty text elements; "
            "can't verify caption population from this tile"
        )

    candidate.locator(".video-overlay").first.click()
    page.wait_for_selector(".lightbox.visible", timeout=5_000)
    page.wait_for_function(
        "document.getElementById('lightbox-video-container').offsetHeight > 0",
        timeout=5_000,
    )

    caption_block = page.locator(".lightbox-caption-container").inner_text().strip()

    # First-order check: caption block is non-empty.  Cheap, clear failure
    # mode message.
    assert caption_block, (
        f"lightbox caption block is empty; "
        f"expected at least one of these source texts to populate it: "
        f"{expected_texts!r}"
    )

    # Stronger check: at least one source text actually appears in the
    # caption.  Catches the case where the caption block is populated
    # with the wrong content (e.g. a stale value from a previous tile).
    matched = [t for t in expected_texts if t in caption_block]
    assert matched, (
        f"caption block is populated but none of the source tile's text "
        f"elements appear in it.\n"
        f"  source elements: {expected_texts!r}\n"
        f"  lightbox caption: {caption_block!r}"
    )
