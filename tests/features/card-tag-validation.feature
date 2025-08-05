Feature: Card Tag Validation

@card-tag
Scenario: Validate card tag matches article tag products on redirected page
    Given user logs in and lands on the home page for tag validation
    When user navigates to the perspective page for tag validation
    And user stores the tag text from a card and clicks it
    Then the card tag text should match the article tag products on redirected page
