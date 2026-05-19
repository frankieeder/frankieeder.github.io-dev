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
        page.wait_for_selector(".content", state="attached", timeout=10_000)
        return page

    return _load


def test_dual_vimeo_card_stacks_with_matching_widths(homepage):
    """The card containing vimeo/242977518 has a second vimeo (242974620)
    immediately after.  They should stack vertically at matching widths.
    """
    page = homepage()
    iframe = page.locator("iframe[src*='242977518']").first
    if iframe.count() == 0:
        pytest.skip("vimeo/242977518 tile not on default homepage filter")
    card = iframe.locator("xpath=ancestor::div[contains(@class,'content')][1]")

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
        f"second iframe not below first: "
        f"first.bottom={first['y']+first['height']:.0f}, second.y={second['y']:.0f}"
    )


def test_why_card_renders_scrollbox_and_vimeo_in_same_block(homepage):
    """The 'why; are you paying for this?' card has a scrollbox + vimeo
    (plus text/html rows that are clipped for lightbox-only display).
    The visible media items should stack vertically in source order
    and both fit within the same tile.
    """
    page = homepage("art")
    iframes = page.locator("iframe[src*='384236279']")
    if iframes.count() == 0:
        pytest.skip("'why' card (vimeo/384236279) not visible under ?page=art")
    # Card with non-scrollbox media (vimeo) must not be flattened into
    # one tile per photo — otherwise the vimeo iframe is duplicated.
    assert iframes.count() == 1, (
        f"'why' card was flattened into {iframes.count()} tiles "
        f"(should be 1 — the card has a vimeo alongside the scrollbox)"
    )
    card = iframes.first.locator("xpath=ancestor::div[contains(@class,'content')][1]")

    scrollbox = card.locator(".scrollbox").first
    vimeo = card.locator(".iframe-container").first
    assert scrollbox.count() >= 1, "scrollbox missing"
    assert vimeo.count() >= 1, "vimeo iframe missing"

    s_box = scrollbox.bounding_box()
    v_box = vimeo.bounding_box()
    card_box = card.bounding_box()

    assert v_box["y"] >= s_box["y"] + s_box["height"] - SAME_WIDTH_TOLERANCE_PX, (
        f"vimeo not below scrollbox: scrollbox.bottom={s_box['y']+s_box['height']:.0f}, vimeo.y={v_box['y']:.0f}"
    )
    # Both fit within the tile (single composed block, not overflowing).
    for name, mb in (("scrollbox", s_box), ("vimeo", v_box)):
        assert mb["width"] <= card_box["width"] + SAME_WIDTH_TOLERANCE_PX, (
            f"{name} ({mb['width']:.0f}px) overflows tile ({card_box['width']:.0f}px)"
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
