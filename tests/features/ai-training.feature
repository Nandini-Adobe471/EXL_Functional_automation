Feature: AI Training page regression (AIM Hub)

@ai-training @AIM-01 @skip-login
Scenario: Marquee renders with video background and CTA
    Given user navigates to the AI Training page
    Then the marquee background video should be playing
    And the marquee headline and description should be visible
    And the marquee primary CTA "Get started" should be visible
    When user clicks the marquee primary CTA
    Then the page should scroll to the AI Foundations section

@ai-training @AIM-02 @skip-login
Scenario: Sticky anchor navigation scrolls to the correct sections
    Given user navigates to the AI Training page
    When user clicks each sticky nav tab in turn
    Then each tab click should scroll to its corresponding section
    And the clicked tab should be visually marked active
    When user scrolls the page manually
    Then the sticky nav should remain visible

@ai-training @AIM-03 @skip-login
Scenario: AI Foundations section - course card and CTA
    Given user navigates to the AI Training page
    Then the AI Foundations course card should display eyebrow, title, description and image
    When user clicks the "Start course" CTA
    Then a new tab should open to the AI Essentials for Marketers course page

@ai-training @AIM-04 @skip-login
Scenario: AI Foundations section - resource cards
    Given user navigates to the AI Training page
    Then the AI Foundations section should show 3 resource cards with correct content
    When user clicks each AI Foundations resource card CTA in turn
    Then each resource card CTA should open its correct destination in a new tab

@ai-training @AIM-05 @skip-login
Scenario: Responsible Use section - intro and video cards
    Given user navigates to the AI Training page
    When user clicks "Responsible use" in the sticky nav
    Then the Responsible Use intro copy should be visible
    And the Responsible Use section should show 4 video cards with correct content
    When user clicks each Responsible Use video card in turn
    Then each video card should open its correct playlist URL in a new tab

@ai-training @AIM-06 @skip-login
Scenario: Podcast section
    Given user navigates to the AI Training page
    When user clicks "Podcast" in the sticky nav
    Then the podcast card should display with image, title and description
    When user clicks "Watch now" on the podcast card
    Then a new tab should open to the Perspectives podcast page

@ai-training @AIM-07 @skip-login
Scenario: AI in Practice section - demo/tool cards
    Given user navigates to the AI Training page
    When user clicks "Get hands-on" in the sticky nav
    Then the AI in Practice section should show 6 demo/tool cards with correct content and CTA labels
    When user clicks each AI in Practice card CTA in turn
    Then each demo/tool card CTA should open its correct destination in a new tab

@ai-training @AIM-08 @skip-login
Scenario: Community callout section
    Given user navigates to the AI Training page
    Then the community callout should display image, heading and description
    When user clicks the community callout "Get started" CTA
    Then a new tab should open to the Let's Talk AI community group page

@ai-training @AIM-09 @skip-login
Scenario: Peer Insights section - perspective cards
    Given user navigates to the AI Training page
    When user clicks "Peer insights" in the sticky nav
    Then the Peer Insights section should show 6 perspective cards with correct content
    When user clicks each Peer Insights card in turn
    Then each perspective card should open its correct article in a new tab

@ai-training @AIM-10 @skip-login
Scenario: Events section - event cards with live and on-demand destinations
    Given user navigates to the AI Training page
    When user clicks "Events" in the sticky nav
    Then the featured event card should show its live tag and open the correct external registration page
    And the two on-demand event cards should show correct labels and open their correct internal recording pages

@ai-training @AIM-11 @skip-login
Scenario: External link behavior (new-tab) consistency across the page
    Given user navigates to the AI Training page
    When user clicks external links across at least 4 different sections
    Then each external link should open in a new tab leaving the AI Training page open in the original tab

@ai-training @AIM-12 @skip-login
Scenario: Responsive layout across breakpoints
    Given user navigates to the AI Training page
    Then the marquee and all card sections should render correctly at desktop viewport
    When user resizes to tablet viewport
    Then sections should reflow without overlapping content
    When user resizes to mobile viewport
    Then cards should stack correctly and the marquee should scale appropriately

@ai-training @AIM-13 @skip-login
Scenario: Page loads cleanly with no broken images or console errors
    Given user navigates to the AI Training page
    When user scrolls through the entire page from top to bottom
    Then no image on the page should be broken or missing
    And no JavaScript console errors should be logged during load and scroll
