"""E2E tests for homepage tile rendering — issues that surfaced when
auditing the new flexbox tile layout against real content.
"""
import pytest
from playwright.sync_api import Page


VW, VH = 1920, 1080
MAX_TILE_WIDTH_PX = 500
SAME_WIDTH_TOLERANCE_PX = 8


@pytest.fixture
def homepage(page: Page, server_url: str):
    def _load(filter_arg: str = "") -> Page:
        page.set_viewport_size({"width": VW, "height": VH})
        url = server_url + (f"?page={filter_arg}" if filter_arg else "")
        page.goto(url)
        page.wait_for_selector(".content", timeout=10_000)
        return page

    return _load


def test_dual_vimeo_card_stacks_with_matching_widths(homepage):
    """The 'MUTUAL TRANSGRESSION - RAY COREY & CARLOS MONTES' card has
    two consecutive vimeo embeds.  They should render stacked vertically
    with the same width — a unified block, not side-by-side or
    misaligned.
    """
    page = homepage()
    card = page.locator(
        ".content:has(h2.content-text-element:has-text('MUTUAL TRANSGRESSION - RAY COREY'))"
    ).first
    if card.count() == 0:
        pytest.skip("dual-vimeo card not on default homepage filter")

    iframes = card.locator(".iframe-container")
    assert iframes.count() == 2, (
        f"expected 2 iframe-container children, got {iframes.count()}"
    )

    first = iframes.nth(0).bounding_box()
    second = iframes.nth(1).bounding_box()

    assert abs(first["width"] - second["width"]) <= SAME_WIDTH_TOLERANCE_PX, (
        f"widths differ: {first['width']:.0f} vs {second['width']:.0f}px"
    )
    assert second["y"] >= first["y"] + first["height"] - SAME_WIDTH_TOLERANCE_PX, (
        f"second iframe not stacked below first: "
        f"first.y={first['y']:.0f}+{first['height']:.0f}, second.y={second['y']:.0f}"
    )


def test_why_card_renders_scrollbox_subheader_and_vimeo(homepage):
    """The 'why; are you paying for this?' card has a 3-image scrollbox,
    a subheader, and a vimeo embed.  All three should render in source
    order: scrollbox → subheader → vimeo.
    """
    page = homepage("art")
    card = page.locator(
        ".content:has(h2.content-text-element:has-text('why; are you paying for this?'))"
    ).first
    if card.count() == 0:
        pytest.skip("'why' card not visible under ?page=art")

    scrollbox = card.locator(".scrollbox").first
    subheader = card.locator("h4.content-text-element:has-text('360 Degree Installation View')").first
    vimeo = card.locator(".iframe-container").first

    assert scrollbox.count() >= 1, "scrollbox missing"
    assert subheader.count() >= 1, "subheader missing"
    assert vimeo.count() >= 1, "vimeo iframe missing"

    s_box = scrollbox.bounding_box()
    h_box = subheader.bounding_box()
    v_box = vimeo.bounding_box()

    assert h_box["y"] >= s_box["y"] + s_box["height"] - SAME_WIDTH_TOLERANCE_PX, (
        f"subheader not below scrollbox: scrollbox.bottom={s_box['y']+s_box['height']:.0f}, subheader.y={h_box['y']:.0f}"
    )
    assert v_box["y"] >= h_box["y"] + h_box["height"] - SAME_WIDTH_TOLERANCE_PX, (
        f"vimeo not below subheader: subheader.bottom={h_box['y']+h_box['height']:.0f}, vimeo.y={v_box['y']:.0f}"
    )


@pytest.mark.parametrize("image_basename,filter_page", [
    pytest.param("DSC01344_HaarD13", "still", id="DSC01344"),
    pytest.param("2-D_00001", "still", id="2-D_00001"),
])
def test_image_tile_width_capped(homepage, image_basename, filter_page):
    """Standalone image tiles must not span the whole viewport."""
    page = homepage(filter_page)
    tile = page.locator(f".content:has(img[src*='{image_basename}_lq'])").first
    if tile.count() == 0:
        pytest.skip(f"tile for {image_basename} not on ?page={filter_page}")
    box = tile.bounding_box()
    assert box["width"] <= MAX_TILE_WIDTH_PX, (
        f"tile for {image_basename} is {box['width']:.0f}px wide, "
        f"should be ≤ {MAX_TILE_WIDTH_PX}px (viewport is {VW}px)"
    )
