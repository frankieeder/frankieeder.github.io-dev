"""End-to-end spacing spec for the video lightbox across non-16:9 aspect ratios.

`content.js` attaches an `aspect_ratio` field to each video tile (expressed
as a padding-top percentage — `'100%'` is square, `'75%'` is 4:3, `'41.43%'`
is ~2.41:1 cinematic; default when omitted is 16:9).  When the lightbox
opens, it should:

1. Size the container to match the SOURCE video's aspect ratio so the
   video fills the frame edge-to-edge with no letterboxing.  The
   mustache templates pass each tile's `aspect_ratio` as the 5th arg to
   `openVideoLightBox()`, which sets a `--video-aspect-ratio` CSS
   variable on `.lightbox-video-container`.  The CSS consumes the
   variable for both `aspect-ratio` and the width-derived calc.

2. Keep the [video + caption] block vertically centered and the video
   horizontally centered — regardless of source aspect.  The vertical
   invariant was previously broken by `margin: auto` on
   `.lightbox-video-container` (auto margins on a flex item absorb free
   space asymmetrically); fixed in PR #27.

We pick a single representative viewport (1280×720) for the aspect-ratio
matrix.  Viewport-scaling is orthogonal to source-aspect-handling, so a
fuller (viewport × aspect) matrix would dilute signal without adding
coverage — use `tests/test_video_lightbox.py` for the viewport matrix on
the 16:9 path.

### Selector strategy

`render.js:constrainVideoHeights()` runs immediately after mustache
renders the page and mutates every `.iframe-container`, replacing its
inline `style="padding-top: X%"` with `padding-top: 0` plus explicit
pixel width/height.  So `[style*="padding-top: ..."]` selectors are
unreliable post-render.  We target by iframe `src` instead — the video
ID embedded in the URL is immutable.  If a pinned ID is removed from
`content.js`, the test `skip()`s with a clear message rather than
timing out on a missing element.
"""
import pytest
from playwright.sync_api import Page


# One pinned tile per aspect ratio.  Each ID is chosen to satisfy two
# constraints: (a) the tile has an explicit `aspect_ratio` field in
# content.js at the chosen value, and (b) the surrounding post is tagged
# `frankie_eder` so `filteredContent()` keeps it on the default homepage
# (otherwise the test silently skips for "tile not in DOM").
#
# The fragment matches inside the iframe `src` attribute; for vimeo it's
# `vimeo.com/video/<id>`, for youtube it's `youtube.com/embed/<id>`.
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

VIEWPORT = (1280, 720)
ASPECT_TOLERANCE = 0.02
MARGIN_TOLERANCE_PX = 2


@pytest.fixture
def open_lightbox_for(page: Page, server_url: str):
    """Return a helper that opens the lightbox for the tile whose iframe
    `src` contains `src_fragment`.
    """
    def _open(src_fragment: str) -> Page:
        page.set_viewport_size({"width": VIEWPORT[0], "height": VIEWPORT[1]})
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
        page.wait_for_function(
            "document.getElementById('lightbox-video-container').offsetHeight > 0",
            timeout=5_000,
        )
        return page

    return _open


@pytest.mark.parametrize("src_fragment,expected_aspect", SOURCES)
def test_lightbox_matches_source_aspect_ratio(
    open_lightbox_for, src_fragment, expected_aspect
):
    """Lightbox container should match the source video's aspect ratio
    so the video fills the frame edge-to-edge with no letterboxing.

    Fixed by plumbing the source tile's `aspect_ratio` as the 5th arg
    of `openVideoLightBox()`, which sets a `--video-aspect-ratio` CSS
    variable that the container's `aspect-ratio` and width-calc consume.
    """
    page = open_lightbox_for(src_fragment)
    box = page.locator("#lightbox-video-container").bounding_box()
    ratio = box["width"] / box["height"]
    assert abs(ratio - expected_aspect) < ASPECT_TOLERANCE, (
        f"lightbox aspect = {ratio:.3f} (size {box['width']:.0f}×{box['height']:.0f}px), "
        f"expected ~{expected_aspect:.3f} for source {src_fragment}"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect", SOURCES)
def test_lightbox_vertically_centered(
    open_lightbox_for, src_fragment, _expected_aspect
):
    """Top whitespace (viewport top → video top) == bottom whitespace
    (caption bottom → viewport bottom).  Holds for any source aspect.
    """
    page = open_lightbox_for(src_fragment)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    top = video["y"]
    bottom = VIEWPORT[1] - (caption["y"] + caption["height"])
    assert abs(top - bottom) <= MARGIN_TOLERANCE_PX, (
        f"top={top:.1f}px, bottom={bottom:.1f}px (Δ={abs(top - bottom):.1f}px)"
    )


@pytest.mark.parametrize("src_fragment,_expected_aspect", SOURCES)
def test_lightbox_horizontally_centered(
    open_lightbox_for, src_fragment, _expected_aspect
):
    """Left margin == right margin.  Flex centering on `.lightbox-content`
    handles this regardless of the container's size, so this should pass
    on every source aspect today.  Kept as a regression guard against a
    future change that breaks it (e.g. switching to `align-items:
    flex-start`).
    """
    page = open_lightbox_for(src_fragment)
    box = page.locator("#lightbox-video-container").bounding_box()
    left = box["x"]
    right = VIEWPORT[0] - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"left={left:.1f}px, right={right:.1f}px (Δ={abs(left - right):.1f}px)"
    )
