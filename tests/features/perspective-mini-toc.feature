Feature: Perspective Page Mini TOC Validation

@mini-toc @skip-login
Scenario: Validate mini TOC functionality on perspective article pages
    Given user logs in and lands on the home page for mini TOC validation
    When user navigates to the perspective page for mini TOC validation
    And user clicks on the last card of an authorable card block
    Then the mini TOC should be checked for visibility
    And if mini TOC is visible verify clicking on TOC items scrolls to respective sections
    And if mini TOC is not visible try another card from next authorable card block
