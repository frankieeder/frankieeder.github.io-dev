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


def test_why_card_composed_into_one_tile_with_two_subrows(homepage):
    """The 'why; are you paying for this?' card has a scrollbox + vimeo
    (different media types — thematically a 3-channel installation
    view + a 360° installation video).  Different-type media stay
    composed in one tile as two sub-rows: scrollbox above, vimeo below.
    """
    page = homepage("art")
    iframes = page.locator("iframe[src*='384236279']")
    if iframes.count() == 0:
        pytest.skip("'why' card (vimeo/384236279) not visible under ?page=art")
    assert iframes.count() == 1, (
        f"vimeo/384236279 appears {iframes.count()} times — should be 1"
    )
    card = iframes.first.locator("xpath=ancestor::div[contains(@class,'content')][1]")

    # Composed: both scrollbox and vimeo live in the same tile.
    assert card.locator(".scrollbox").count() == 1, (
        "scrollbox missing from the why-card tile — was it split out?"
    )
    assert card.locator(".iframe-container").count() == 1, (
        "iframe-container missing from the why-card tile — was it split out?"
    )

    # Scrollbox sub-row sits above the vimeo sub-row.
    sb = card.locator(".scrollbox").first.bounding_box()
    vi = card.locator(".iframe-container").first.bounding_box()
    assert vi["y"] >= sb["y"] + sb["height"] - SAME_WIDTH_TOLERANCE_PX, (
        f"vimeo sub-row not below scrollbox sub-row: "
        f"scrollbox.bottom={sb['y']+sb['height']:.0f}, vimeo.y={vi['y']:.0f}"
    )
    # Sub-rows should be the same width so the tile looks like a unified
    # block rather than two media items of different widths stacked.
    assert abs(sb["width"] - vi["width"]) <= SAME_WIDTH_TOLERANCE_PX, (
        f"scrollbox and vimeo sub-rows have different widths: "
        f"scrollbox={sb['width']:.0f}, vimeo={vi['width']:.0f}"
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


@pytest.mark.parametrize("filter_page", ["", "art", "still"])
def test_tile_heights_consistent_with_neighbors(homepage, filter_page):
    """Every visible tile on a page should be roughly the same height as
    its neighbors.  A composed multi-media tile (e.g. why-card scrollbox
    + vimeo) must fit the same row height as single-media tiles around
    it — otherwise the wrap layout leaves awkward empty gaps next to it.
    Tolerance is generous (±50px) for natural variance in caption-block
    or padding, but a 2× outlier is the bug we're catching.
    """
    page = homepage(filter_page)
    # Wait for images + iframes to settle so heights are stable.
    page.wait_for_function(
        "() => Array.from(document.querySelectorAll('.content img'))"
        ".every(i => i.complete || i.naturalWidth === undefined)",
        timeout=10_000,
    )
    tile_heights = [
        b["height"] for b in (
            page.locator(".content").nth(i).bounding_box()
            for i in range(page.locator(".content").count())
        ) if b and b["height"] > 0
    ]
    if len(tile_heights) < 2:
        pytest.skip(f"too few tiles on ?page={filter_page!r}")

    tile_heights.sort()
    median = tile_heights[len(tile_heights) // 2]
    max_h = max(tile_heights)
    min_h = min(tile_heights)
    # Tight tolerance — every tile (composed or single-media) should be
    # exactly TILE_HEIGHT (300px) tall.  Sub-pixel rounding + line-height
    # baseline gives a few px of slop; 10 covers it without hiding real
    # bugs.
    TILE_HEIGHT_TOLERANCE_PX = 10

    assert max_h - median <= TILE_HEIGHT_TOLERANCE_PX, (
        f"tallest tile is {max_h:.0f}px vs median {median:.0f}px "
        f"on ?page={filter_page!r}.  Composed multi-media tiles need "
        f"to fit the same row height as single-media tiles."
    )
    assert median - min_h <= TILE_HEIGHT_TOLERANCE_PX, (
        f"shortest tile is {min_h:.0f}px vs median {median:.0f}px "
        f"on ?page={filter_page!r}.  Composed multi-media tiles need "
        f"to fill the same row height as single-media tiles."
    )
