Feature: Perspective Page
  As a user
  I want to filter perspectives by author type
  So that I can view perspectives authored by Adobe
@skip-login @perspective-author-badge
  Scenario: Filter perspectives by author type '&nbsp;Adobe' and verify badge
    Given user logs in and lands on PHP page
    When user navigates to the perspective page
    And user selects author type as "Adobe"
    Then verify first card displays with "By Adobe" badge
    # Mobile view testing
    When user sets viewport to mobile size for breadcrumb validation
    And user navigates to the perspective page
    And user selects author type as "Adobe" in mobile view
    Then verify first card displays with "By Adobe" badge in mobile view
@author-info @skip-login
Scenario: Validate author information consistency across pages
    Given user logs in and lands on the home page for author validation
    When user navigates to the perspective page for author validation
    And user clicks on a card with author information
    Then user extracts author info text from article marquee
    And user navigates to author bio page
    Then author info from article should match author bio page
    
@perspective-breadcrumb
Scenario: Validate breadcrumb text matches page heading on redirected page
    Given user logs in and lands on the home page
    When user navigates to the perspectives page for breadcrumb validation
    And user clicks on a card from the authorable-card data block
    Then the breadcrumb span text should match the page heading on redirected page
    # Mobile view testing - staying on the same redirected page
    When user sets viewport to mobile size for breadcrumb validation
    Then the breadcrumb span text should match the page heading on redirected page in mobile view

    @mini-toc @skip-login
Scenario: Validate mini TOC functionality on perspective article pages
    Given user logs in and lands on the home page for mini TOC validation
    When user navigates to the perspective page for mini TOC validation
    And user clicks on the last card of an authorable card block
    Then the mini TOC should be checked for visibility
    And if mini TOC is visible verify clicking on TOC items scrolls to respective sections
    And if mini TOC is not visible try another card from next authorable card block

    @card-tag @skip-login
Scenario: Validate card tag matches article tag products on redirected page
    Given user logs in and lands on the home page for tag validation
    When user navigates to the perspective page for tag validation
    And user stores the tag text from a card and clicks it
    Then the card tag text should match the article tag products on redirected page
