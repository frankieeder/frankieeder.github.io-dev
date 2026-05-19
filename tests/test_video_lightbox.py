"""E2E geometry tests: SOURCES × VIEWPORTS.  Gotchas in CLAUDE.md."""
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

MATRIX = [
    pytest.param(
        src.values[0], src.values[1], vp.values[0], vp.values[1],
        id=f"{src.id}-{vp.id}",
    )
    for src in SOURCES
    for vp in VIEWPORTS
]


def expected_min_margin(vw: int, vh: int) -> float:
    return max(24, 0.05 * min(vw, vh))


def video_margins(video, caption, vw: int, vh: int):
    return (
        video["x"],
        vw - (video["x"] + video["width"]),
        video["y"],
        vh - (caption["y"] + caption["height"]),
    )


@pytest.fixture
def open_lightbox_for(page: Page, server_url: str):
    def _open(src_fragment: str, viewport_w: int, viewport_h: int) -> Page:
        page.set_viewport_size({"width": viewport_w, "height": viewport_h})
        page.goto(server_url)
        page.wait_for_selector(".video-overlay", timeout=10_000)

        overlay = page.locator(
            f'.iframe-container:has(iframe[src*="{src_fragment}"]) .video-overlay'
        ).first
        if overlay.count() == 0:
            pytest.skip(f"no tile with iframe src containing {src_fragment!r}")
        overlay.click()

        page.wait_for_selector(".lightbox.visible", timeout=5_000)
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
    """Min of (left, right, top, bottom) margins == M = max(24px, 5vmin)."""
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
    """Neither the video nor the caption should overflow the viewport."""
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
    """Whitespace above video == whitespace below caption."""
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
    """Left margin == right margin."""
    page = open_lightbox_for(src_fragment, vw, vh)
    box = page.locator("#lightbox-video-container").bounding_box()
    left = box["x"]
    right = vw - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"left={left:.1f}px, right={right:.1f}px (Δ={abs(left - right):.1f}px)"
    )
