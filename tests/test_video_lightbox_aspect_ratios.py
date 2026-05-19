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

# Two viewports — common laptop + standard desktop.  Catches viewport-
# dependent layout regressions that only show up at one screen size.
VIEWPORTS = [
    pytest.param(1280, 720, id="1280x720"),
    pytest.param(1920, 1080, id="1920x1080"),
]

ASPECT_TOLERANCE = 0.02
MARGIN_TOLERANCE_PX = 4


def expected_min_margin(vw: int, vh: int) -> float:
    """The minimum margin (M) we promise on all four sides around the
    video.  Matches render.js:fitVideoToLightbox(): max(24px, 5vmin).
    """
    return max(24, 0.05 * min(vw, vh))


def video_margins(video, caption, vw: int, vh: int):
    """Return (left, right, top, bottom) margins around the video, in px.

    `bottom` is measured from the BOTTOM OF THE CAPTION to the bottom of
    the viewport — the caption sits in the bottom-margin area, so the
    "bottom margin" of the lightbox composition is the gap from caption-
    bottom to viewport-bottom, not video-bottom to viewport-bottom.
    """
    return (
        video["x"],
        vw - (video["x"] + video["width"]),
        video["y"],
        vh - (caption["y"] + caption["height"]),
    )


# Test matrix is sources × viewports.  Express as a cartesian product
# rather than a separate parametrize so it's a single per-test id.
MATRIX = [
    pytest.param(src.values[0], src.values[1], vp.values[0], vp.values[1],
                 id=f"{src.id}-{vp.id}")
    for src in SOURCES
    for vp in VIEWPORTS
]


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
        page.wait_for_function(
            "document.getElementById('lightbox-video-container').offsetHeight > 0",
            timeout=5_000,
        )
        # Give one extra rAF tick so JS-driven sizing (fitVideoToLightbox)
        # has run after caption is laid out.
        page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
        return page

    return _open


@pytest.mark.parametrize("src_fragment,expected_aspect,vw,vh", MATRIX)
def test_lightbox_matches_source_aspect_ratio(
    open_lightbox_for, src_fragment, expected_aspect, vw, vh
):
    """Lightbox container should match the source video's aspect ratio
    so the video fills the frame edge-to-edge with no letterboxing.
    """
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
    """The minimum of the four margins around the video equals M.

    M = max(24px, 5vmin) — the promised minimum on every side.  Other
    margins may be larger when the source aspect doesn't match the
    available rectangle (e.g. square video in a 16:9 viewport: sides
    will be much wider than top/bottom by geometric necessity), but the
    SMALLEST of the four is always M.

    This is the test that captures "uneven spacing" complaints: if any
    side dips below M, the video is too big (touching the edge); if
    every side is much bigger than M, the video is smaller than it
    needs to be.
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    video = page.locator("#lightbox-video-container").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    left, right, top, bottom = video_margins(video, caption, vw, vh)
    M = expected_min_margin(vw, vh)

    margins = {"left": left, "right": right, "top": top, "bottom": bottom}

    # No margin should dip below M.
    for name, m in margins.items():
        assert m >= M - MARGIN_TOLERANCE_PX, (
            f"{name} margin = {m:.1f}px is below promised M = {M:.1f}px "
            f"(all margins: {margins})"
        )

    # At least one margin should equal M (the binding constraint).  If
    # all margins are much greater than M, the video is undersized.
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
    handles this regardless of the container's size, so this should pass
    on every source aspect today.  Kept as a regression guard against a
    future change that breaks it (e.g. switching to `align-items:
    flex-start`).
    """
    page = open_lightbox_for(src_fragment, vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    left = box["x"]
    right = vw - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"left={left:.1f}px, right={right:.1f}px (Δ={abs(left - right):.1f}px)"
    )
