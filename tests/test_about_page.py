"""E2E tests for the /about page rendering.

PR #26's contents.mustache wrapped every text row in `.content-text-element`
(screen-reader-only), which broke page-style cards where the html IS the
visible body. The `visible_text: true` opt-in flag + .visible-text class fix
that for the about and newsletter cards.

These tests pin the contract: about page must render its bio visibly, CONTACT
ME button must be horizontally centered, no headshot img, and the card must
carry the visible-text class so future global tile changes don't silently
re-break it.
"""
import pytest
from playwright.sync_api import Page


VW, VH = 1920, 1080
CENTER_TOLERANCE_PX = 4   # 1-2px subpixel jitter is normal; 4 is a safe pad


@pytest.fixture
def about_page(page: Page, server_url: str):
    page.set_viewport_size({"width": VW, "height": VH})
    page.goto(server_url + "?page=about")
    page.wait_for_selector(".content", state="attached", timeout=10_000)
    return page


def test_about_card_has_visible_text_class(about_page):
    """visible_text: true in content.js -> `visible-text` class on .content."""
    card = about_page.locator(".content").first
    classes = card.get_attribute("class") or ""
    assert "visible-text" in classes, (
        f"expected .visible-text on about card, got class={classes!r}. "
        f"Check `visible_text: true` is set on the about card in content.js "
        f"and that contents.mustache emits the class."
    )


def test_bio_paragraphs_render_visibly(about_page):
    """The about_blurb's <p> tags must have non-zero height (not SR-only).

    Pins the .visible-text CSS override, not any specific bio content — the
    blurb is now a one-line link to inkfreeread.com, but as long as
    SR-only collapsing doesn't reapply, the assertion holds for any future
    copy too.
    """
    paras = about_page.locator(".about_blurb p")
    count = paras.count()
    assert count >= 1, f"expected >=1 bio paragraph, got {count}"
    for i in range(count):
        box = paras.nth(i).bounding_box()
        assert box is not None, f"para {i} has no bounding box (display:none?)"
        assert box["height"] > 10, (
            f"para {i} height={box['height']:.1f}px — looks SR-only-collapsed "
            f"(.content-text-element wasn't unset by .visible-text override)"
        )


def test_about_links_to_inkfreeread(about_page):
    """Bio should point to inkfreeread.com."""
    link = about_page.locator('.about_blurb a[href*="inkfreeread.com"]')
    assert link.count() >= 1, "no link to inkfreeread.com in about_blurb"


def test_no_headshot_image(about_page):
    """Headshot was removed per design — page should not load it."""
    headshots = about_page.locator('img[src*="headshot"]')
    assert headshots.count() == 0, (
        f"headshot img still present ({headshots.count()} matches). "
        f"Should have been dropped from the about_blurb html."
    )


def test_contact_me_button_horizontally_centered(about_page):
    """CONTACT ME button is `width: 300px; margin: 0` by default — needs the
    .content.visible-text .github-button override to center it inside the
    full-width card.
    """
    button = about_page.locator(".github-button").first
    assert button.count() > 0, "no CONTACT ME button found on about page"

    card = about_page.locator(".content.visible-text").first
    btn_box = button.bounding_box()
    card_box = card.bounding_box()
    assert btn_box and card_box, "missing bounding boxes"

    btn_center = btn_box["x"] + btn_box["width"] / 2
    card_center = card_box["x"] + card_box["width"] / 2
    offset = abs(btn_center - card_center)
    assert offset < CENTER_TOLERANCE_PX, (
        f"CONTACT ME button off-center by {offset:.1f}px "
        f"(btn_center={btn_center:.1f}, card_center={card_center:.1f}). "
        f"Check `.content.visible-text .github-button {{ margin: 0 auto }}` "
        f"is present and not overridden."
    )


def test_about_card_horizontally_centered(about_page):
    """Card itself must center in the viewport, not shift right due to the
    base .content's `margin-right: 10px` / `padding-right: 10px`.
    """
    card = about_page.locator(".content.visible-text").first
    box = card.bounding_box()
    assert box, "no card bounding box"
    card_center = box["x"] + box["width"] / 2
    viewport_center = VW / 2
    offset = abs(card_center - viewport_center)
    assert offset < CENTER_TOLERANCE_PX, (
        f"about card off-center by {offset:.1f}px "
        f"(card_center={card_center:.1f}, viewport_center={viewport_center:.1f})"
    )
