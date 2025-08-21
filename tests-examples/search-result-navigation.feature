Feature: Search Result Navigation
@search-result-navigation
Scenario: Navigate to search result page, click on first result, and verify title color change
    Given user navigates directly to search page
    Then search results are displayed
    When user clicks on the first search result
    Then user should land on the result detail page
    When user navigates back to search results
    Then the title of the first search result should have changed color
