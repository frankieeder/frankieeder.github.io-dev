"""End-to-end geometry tests for the video lightbox.

Matrix: 4 source aspects (16:9, 82.85% portrait-ish, 1:1 square,
2.41:1 cinematic) × 4 viewports (mobile, tablet, small desktop,
standard desktop).  Individual tests document the invariant they
enforce.

### Gotchas

- `render.js:constrainVideoHeights()` rewrites every `.iframe-container`'s
  inline `style="padding-top: X%"` to `padding-top: 0` post-render, so
  attribute selectors on padding-top are unreliable.  Target by iframe
  `src` instead — video IDs are immutable.
- Each pinned ID must (a) have an explicit `aspect_ratio` field at the
  targeted value AND (b) belong to a post tagged `frankie_eder`, or
  `filteredContent()` excludes it from the homepage and the test
  silently skips.
"""
import pytest
from playwright.sync_api import Page


SOURCES = [
    pytest.param(
        "vimeo.com/video/697623576", 16 / 9,
        id="16-9-explicit",
    ),
    pytest.param(
        "vimeo.com/video/408120845", 100 / 82.85,
        id="portrait-ish-82-85pct",
    ),
    pytest.param(
        "vimeo.com/video/486248111", 1.0,
        id="1-1-square",
    ),
    pytest.param(
        "vimeo.com/video/244111603", 100 / 41.43,
        id="2-41-1-cinematic",
    ),
]

VIEWPORTS = [
    pytest.param(320, 568, id="320x568-mobile-portrait"),
    pytest.param(768, 1024, id="768x1024-tablet-portrait"),
    pytest.param(1280, 720, id="1280x720-small-desktop"),
    pytest.param(1920, 1080, id="1920x1080-desktop"),
]

ASPECT_TOLERANCE = 0.02
MARGIN_TOLERANCE_PX = 4

# Cartesian product of sources × viewports — one test row per pair.
MATRIX = [
    pytest.param(
        src.values[0], src.values[1], vp.values[0], vp.values[1],
        id=f"{src.id}-{vp.id}",
    )
    for src in SOURCES
    for vp in VIEWPORTS
]


def expected_min_margin(vw: int, vh: int) -> float:
    """The minimum margin `M` we promise on all four sides.  Mirror of
    `render.js:fitVideoToLightbox()`: `max(24px, 5vmin)`.
    """
    return max(24, 0.05 * min(vw, vh))


def video_margins(video, caption, vw: int, vh: int):
    """Return (left, right, top, bottom) margins around the video, in px.

    `bottom` is measured from the BOTTOM OF THE CAPTION to the bottom of
    the viewport — the caption sits in the bottom-margin area, so the
    composition's bottom margin is `viewport_h - caption_bottom`, not
    `viewport_h - video_bottom`.
    """
    return (
        video["x"],
        vw - (video["x"] + video["width"]),
        video["y"],
        vh - (caption["y"] + caption["height"]),
    )


@pytest.fixture
def open_lightbox_for(page: Page, server_url: str):
    """Return a helper that opens the lightbox for the tile whose iframe
    `src` contains `src_fragment`, at the requested viewport size.
    """
    def _open(src_fragment: str, viewport_w: int, viewport_h: int) -> Page:
        page.set_viewport_size({"width": viewport_w, "height": viewport_h})
        page.goto(server_url)

        # Content renders async (mustache fetches templates, then interpolates).
        page.wait_for_selector(".video-overlay", timeout=10_000)

        overlay = page.locator(
            f'.iframe-container:has(iframe[src*="{src_fragment}"]) .video-overlay'
        ).first
        if overlay.count() == 0:
            pytest.skip(
                f"no video tile with iframe src containing {src_fragment!r} "
                f"found in content.js — update SOURCES or the pinned ID"
            )
        overlay.click()

        page.wait_for_selector(".lightbox.visible", timeout=5_000)
        # Synchronize on render.js:fitVideoToLightbox() completion via
        # the `data-fit-done` marker it sets at the end of its work.
        # Avoids reading the CSS-fallback geometry mid-resize.
        page.wait_for_selector(
            "#lightbox-video-container[data-fit-done='1']", timeout=5_000
        )
        return page

    return _open


@pytest.mark.parametrize("src_fragment,expected_aspect,vw,vh", MATRIX)
def test_lightbox_matches_source_aspect_ratio(
    open_lightbox_for, src_fragment, expected_aspect, vw, vh
):
    """Lightbox container should match the source video's aspect ratio."""
    page = open_lightbox_for(src_fragment, vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    ratio = box["width"] / box["height"]
    assert abs(ratio - expected_aspect) < ASPECT_TOLERANCE, (
        f"lightbox aspect = {ratio:.3f} (size {box['width']:.0f}×{box['height']:.0f}px), "
        f"expected ~{expected_aspect:.3f} for source {src_fragment}"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect,vw,vh", MATRIX)
def test_minimum_margin_consistent_on_all_sides(
    open_lightbox_for, src_fragment, _expected_aspect, vw, vh
):
    """Min of (left, right, top, bottom) margins == M = max(24px, 5vmin).

    For non-matching aspects (e.g. square in 16:9) other margins exceed
    M — geometric necessity.  Catches: any margin < M → video
    oversized; all margins > M → video undersized.
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    left, right, top, bottom = video_margins(video, caption, vw, vh)
    M = expected_min_margin(vw, vh)

    margins = {"left": left, "right": right, "top": top, "bottom": bottom}

    for name, m in margins.items():
        assert m >= M - MARGIN_TOLERANCE_PX, (
            f"{name} margin = {m:.1f}px is below promised M = {M:.1f}px "
            f"(all margins: {margins})"
        )

    min_observed = min(margins.values())
    assert min_observed <= M + MARGIN_TOLERANCE_PX, (
        f"smallest margin = {min_observed:.1f}px > M = {M:.1f}px — video "
        f"is smaller than it could be (all margins: {margins})"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect,vw,vh", MATRIX)
def test_video_and_caption_fit_in_viewport(
    open_lightbox_for, src_fragment, _expected_aspect, vw, vh
):
    """Neither the video nor the caption should overflow the viewport.

    Catches the "squished to the top" failure mode: when total content
    > viewport, `justify-content: center` has no free space to distribute,
    so the video pins to the top of `.lightbox-content` and the caption
    overflows the bottom (clipped by `.lightbox { overflow: hidden }`).
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()

    assert video["y"] >= 0, f"video overflows top: y={video['y']:.1f}px"
    assert caption["y"] + caption["height"] <= vh + MARGIN_TOLERANCE_PX, (
        f"caption overflows bottom: caption_bottom={caption['y'] + caption['height']:.1f}px, "
        f"viewport_h={vh}px"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect,vw,vh", MATRIX)
def test_lightbox_vertically_centered(
    open_lightbox_for, src_fragment, _expected_aspect, vw, vh
):
    """Top whitespace (viewport top → video top) == bottom whitespace
    (caption bottom → viewport bottom).  Holds for any source aspect.
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    top = video["y"]
    bottom = vh - (caption["y"] + caption["height"])
    assert abs(top - bottom) <= MARGIN_TOLERANCE_PX, (
        f"top={top:.1f}px, bottom={bottom:.1f}px (Δ={abs(top - bottom):.1f}px)"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect,vw,vh", MATRIX)
def test_lightbox_horizontally_centered(
    open_lightbox_for, src_fragment, _expected_aspect, vw, vh
):
    """Left margin == right margin.  Flex centering on `.lightbox-content`
    handles this regardless of container size; kept as a regression
    guard against a future change that breaks it.
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    left = box["x"]
    right = vw - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"left={left:.1f}px, right={right:.1f}px (Δ={abs(left - right):.1f}px)"
    )
