Feature: Bookmark Management on Experience League

@bookmark-management @skip-login
Scenario: Add and remove bookmarks for browse cards
    Given user logs in to Experience Leaguee
    When user navigates to browse page
    And user gets the title of the first card in tabbed-cards-wrapper
    And user bookmarks the first card
    And user navigates to bookmarks page
    Then user should see the bookmarked card with the same title
    When user removes the bookmark from the card
    And user navigates back to browse page
    Then the card should be available for bookmarking again
