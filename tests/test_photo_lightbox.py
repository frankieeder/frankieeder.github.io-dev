"""E2E geometry tests for the photo lightbox.  Mirror of the video
lightbox invariants — the photo path should behave the same way.
"""
import pytest
from playwright.sync_api import Page


VIEWPORTS = [
    pytest.param(320, 568, id="320x568"),
    pytest.param(768, 1024, id="768x1024"),
    pytest.param(1280, 720, id="1280x720"),
    pytest.param(1920, 1080, id="1920x1080"),
]

ASPECT_TOLERANCE = 0.02
MARGIN_TOLERANCE_PX = 4
MAX_GAP_TO_CAPTION_PX = 8


def expected_min_margin(vw: int, vh: int) -> float:
    return max(24, 0.05 * min(vw, vh))


@pytest.fixture
def open_first_photo(page: Page, server_url: str):
    def _open(viewport_w: int, viewport_h: int) -> Page:
        page.set_viewport_size({"width": viewport_w, "height": viewport_h})
        page.goto(server_url)
        page.wait_for_selector(".content a:has(img)", timeout=10_000)
        page.locator(".content a:has(img)").first.click()
        page.wait_for_selector(".lightbox.visible", timeout=5_000)
        page.wait_for_function(
            "() => { const i = document.getElementById('lightbox-im');"
            " return i && i.complete && i.naturalWidth > 0; }",
            timeout=10_000,
        )
        return page

    return _open


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_image_rendered_at_natural_aspect_ratio(open_first_photo, vw, vh):
    """Image box matches the photo's natural aspect — no object-fit bars."""
    page = open_first_photo(vw, vh)
    box = page.locator("#lightbox-im").bounding_box()
    natural = page.evaluate(
        "() => { const i = document.getElementById('lightbox-im');"
        " return { w: i.naturalWidth, h: i.naturalHeight }; }"
    )
    natural_aspect = natural["w"] / natural["h"]
    rendered_aspect = box["width"] / box["height"]
    assert abs(rendered_aspect - natural_aspect) < ASPECT_TOLERANCE, (
        f"rendered aspect = {rendered_aspect:.3f} ({box['width']:.0f}×{box['height']:.0f}px), "
        f"natural = {natural_aspect:.3f} ({natural['w']}×{natural['h']}px) — "
        f"object-fit bars present"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_image_horizontally_centered(open_first_photo, vw, vh):
    page = open_first_photo(vw, vh)
    box = page.locator("#lightbox-im").bounding_box()
    left = box["x"]
    right = vw - (box["x"] + box["width"])
    assert abs(left - right) <= MARGIN_TOLERANCE_PX, (
        f"left={left:.1f}, right={right:.1f}"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_caption_sticks_to_image_bottom(open_first_photo, vw, vh):
    """Caption directly under photo, no large empty gap (no object-fit
    bars between visible photo content and caption)."""
    page = open_first_photo(vw, vh)
    image = page.locator("#lightbox-im").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    gap = caption["y"] - (image["y"] + image["height"])
    assert -MARGIN_TOLERANCE_PX <= gap <= MAX_GAP_TO_CAPTION_PX, (
        f"image-to-caption gap = {gap:.1f}px (must be 0..{MAX_GAP_TO_CAPTION_PX}px)"
    )


@pytest.mark.parametrize("vw,vh", VIEWPORTS)
def test_image_and_caption_fit_in_viewport(open_first_photo, vw, vh):
    page = open_first_photo(vw, vh)
    image = page.locator("#lightbox-im").bounding_box()
    caption = page.locator(".lightbox-caption-container").bounding_box()
    assert image["y"] >= 0, f"image overflows top: y={image['y']:.1f}"
    assert caption["y"] + caption["height"] <= vh + MARGIN_TOLERANCE_PX, (
        f"caption overflows bottom"
    )


def test_buy_print_hidden_for_no_buy_print_card(page, server_url):
    """Cards flagged `no_buy_print: true` in content.js (e.g. the 'why;
    are you paying for this?' installation) must not show the BUY PRINT
    button in the photo lightbox.  Default behavior unchanged for
    everything else.
    """
    page.set_viewport_size({"width": 1280, "height": 720})
    page.goto(server_url + "?page=art")
    page.wait_for_selector(".content", state="attached", timeout=10_000)

    photo = page.locator(".content[data-no-buy-print] img").first
    if photo.count() == 0:
        pytest.skip("no card with data-no-buy-print under ?page=art")
    photo.locator("xpath=ancestor::a[1]").click()
    page.wait_for_selector(".lightbox.visible", timeout=5_000)

    container = page.locator(".buy-print-container").first
    assert container.is_hidden(), (
        "BUY PRINT container is visible on a no-buy-print card"
    )
