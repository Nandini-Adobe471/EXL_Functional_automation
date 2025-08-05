Feature: Author Information Validation

@author-info @skip-login
Scenario: Validate author information consistency across pages
    Given user logs in and lands on the home page for author validation
    When user navigates to the perspective page for author validation
    And user clicks on a card with author information
    Then user extracts author info text from article marquee
    And user navigates to author bio page
    Then author info from article should match author bio page
