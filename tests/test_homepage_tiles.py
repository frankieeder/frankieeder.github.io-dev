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


def test_dual_vimeo_card_split_into_separate_tiles(homepage):
    """The source card with two consecutive type_vimeo rows (242977518 +
    242974620) should be split by flattenMultiPhotoCards into two
    .content tiles, each containing one of the videos.  Stacking two
    iframes inside one tile produced a tall awkward block; splitting
    matches the rest of the layout.
    """
    page = homepage()
    iframe = page.locator("iframe[src*='242977518']").first
    if iframe.count() == 0:
        pytest.skip("vimeo/242977518 tile not on default homepage filter")
    card = iframe.locator("xpath=ancestor::div[contains(@class,'content')][1]")
    iframes_in_card = card.locator(".iframe-container")
    assert iframes_in_card.count() == 1, (
        f"expected each split tile to hold exactly 1 iframe, "
        f"got {iframes_in_card.count()} — flatten regressed?"
    )

    sibling = page.locator("iframe[src*='242974620']").first
    assert sibling.count() >= 1, "second vimeo (242974620) missing from page"


def test_why_card_split_into_scrollbox_tile_and_vimeo_tile(homepage):
    """The 'why; are you paying for this?' card has a scrollbox + vimeo.
    flattenMultiPhotoCards splits these into two separate tiles so
    neither extends across multiple wrap rows.  The scrollbox photos
    stay grouped in one tile (they're a thematic 3-channel set, not
    individual gallery items); the vimeo gets its own tile.
    """
    page = homepage("art")
    iframes = page.locator("iframe[src*='384236279']")
    if iframes.count() == 0:
        pytest.skip("'why' card (vimeo/384236279) not visible under ?page=art")
    assert iframes.count() == 1, (
        f"vimeo/384236279 appears {iframes.count()} times — split should "
        f"produce exactly one vimeo tile"
    )
    vimeo_card = iframes.first.locator("xpath=ancestor::div[contains(@class,'content')][1]")
    assert vimeo_card.locator(".scrollbox").count() == 0, (
        "vimeo tile also has a scrollbox — split didn't separate the media units"
    )

    scrollbox_photo = page.locator("img[src*='why/sw5_cylindrical']").first
    if scrollbox_photo.count() == 0:
        pytest.skip("scrollbox photo not rendered under ?page=art")
    sb_card = scrollbox_photo.locator("xpath=ancestor::div[contains(@class,'content')][1]")
    assert sb_card.locator(".iframe-container").count() == 0, (
        "scrollbox tile also has an iframe — split didn't separate the media units"
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
