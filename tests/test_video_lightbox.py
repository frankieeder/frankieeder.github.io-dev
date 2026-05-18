"""End-to-end geometry tests for the video lightbox.

Each test opens the site in a headless browser at a specific viewport
size, clicks the first video tile, and measures the lightbox via DOM
bounding boxes.  We assert the invariants we actually care about:

- video container is horizontally centered (sanity check)
- the [video + caption] block is vertically centered — guards the fix
  from PR #27 (`margin: auto` previously broke this)
- video container exposes the expected aspect ratio
- video container never overflows the viewport

A future PR will plumb per-video aspect ratios (square, portrait, 2.39:1
cinematic) through to the lightbox — at that point the aspect-ratio test
will become parametrized over the tile's `aspect_ratio` field rather than
hard-coded to 16:9.  Keeping the existing assertion explicit so the
behavior change is loud when it lands.
"""
import pytest
from playwright.sync_api import Page


# Common viewport sizes — covers mobile portrait, tablet, small desktop,
# standard desktop.  Add more as we find regressions.
VIEWPORTS = [
    pytest.param(320, 568, id="320x568-mobile-portrait"),
    pytest.param(768, 1024, id="768x1024-tablet-portrait"),
    pytest.param(1280, 720, id="1280x720-small-desktop"),
    pytest.param(1920, 1080, id="1920x1080-desktop"),
]

# Sub-pixel rounding + flex centering means we can't expect pixel-perfect
# equality.  2px of slop is enough to absorb rounding without hiding real
# layout bugs (the regressions we've seen were tens of px off).
MARGIN_TOLERANCE_PX = 2

# 16:9 ≈ 1.7777.  Aspect ratio is set in CSS, not derived from layout, so
# the rendered ratio should be exact modulo sub-pixel rounding.
ASPECT_RATIO_TOLERANCE = 0.02


@pytest.fixture
def open_first_video(page: Page, server_url: str):
    """Return a helper that resizes the viewport, opens the page, and
    clicks the first video tile.  Yields the Page positioned with the
    lightbox visible.
    """
    def _open(viewport_w: int, viewport_h: int) -> Page:
        page.set_viewport_size({"width": viewport_w, "height": viewport_h})
        page.goto(server_url)

        # Content is rendered async (mustache templates are fetched then
        # interpolated into #contents).  Wait for the first interactive
        # video tile to appear before clicking.
        page.wait_for_selector(".video-overlay", timeout=10_000)
        page.locator(".video-overlay").first.click()

        # `.visible` is added to #lightbox once the open animation starts.
        page.wait_for_selector(".lightbox.visible", timeout=5_000)

        # And wait until the layout has settled (height becomes non-zero).
        page.wait_for_function(
            "document.getElementById('lightbox-video-container').offsetHeight > 0",
            timeout=5_000,
        )
        return page

    return _open


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_video_container_horizontally_centered(open_first_video, vw, vh):
    """Left margin from viewport edge == right margin (flex centering)."""
    page = open_first_video(vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    left = box["x"]
    right = vw - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"video container not horizontally centered: "
        f"left={left:.1f}px, right={right:.1f}px (Δ={abs(left - right):.1f}px)"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_video_plus_caption_vertically_centered(open_first_video, vw, vh):
    """Whitespace above the video == whitespace below the caption.

    Before PR #27's second commit, `margin: auto` on the video container
    absorbed free space asymmetrically: ~50px gap above, ~24px below the
    caption.  This test would have caught that.
    """
    page = open_first_video(vw, vh)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()

    top = video["y"]
    bottom = vh - (caption["y"] + caption["height"])
    assert abs(top - bottom) <= MARGIN_TOLERANCE_PX, (
        f"[video+caption] block not vertically centered: "
        f"top={top:.1f}px, bottom={bottom:.1f}px (Δ={abs(top - bottom):.1f}px)"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_video_container_has_16_9_aspect_ratio(open_first_video, vw, vh):
    """The lightbox currently hard-codes `aspect-ratio: 16 / 9`.

    When per-video aspect ratios land (square/portrait/cinematic), this
    test should be parametrized over the source tile's `aspect_ratio`
    field instead of asserting a constant.
    """
    page = open_first_video(vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    ratio = box["width"] / box["height"]
    assert abs(ratio - 16 / 9) < ASPECT_RATIO_TOLERANCE, (
        f"aspect ratio={ratio:.3f}, expected ~1.778 (16:9)"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_video_container_fits_inside_viewport(open_first_video, vw, vh):
    """Video container must not overflow the viewport in any direction.

    Catches the class of bug where the width formula picks a value larger
    than the available height can accommodate (or vice versa) and the
    container clips against `.lightbox { overflow: hidden }`.
    """
    page = open_first_video(vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    assert box["x"] >= 0, f"overflows left: x={box['x']:.1f}"
    assert box["y"] >= 0, f"overflows top: y={box['y']:.1f}"
    assert box["x"] + box["width"] <= vw + MARGIN_TOLERANCE_PX, (
        f"overflows right: right={box['x'] + box['width']:.1f}, vw={vw}"
    )
    assert box["y"] + box["height"] <= vh + MARGIN_TOLERANCE_PX, (
        f"overflows bottom: bottom={box['y'] + box['height']:.1f}, vh={vh}"
    )
