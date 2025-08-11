Feature: Search functionality
@search-php @skip-login
Scenario: Verify secondary search functionality
    Given user logs in and lands on the home page for search validation
    When user verifies secondary search is visible
    And user clicks in the search input and presses enter
    Then user should land on search result page
    And header search is not visible
    And all filters in the left side are expanded
    And search results are displayed
    And sort by option is displayed
    And result header contains columns "Name, Content Type, Product, Updated"
    When user navigates back to home page for search testing
    Then search bar in header should be visible
    And search picker should have text "All"
    When user clicks in the search input and presses enter again
    Then user should land on search result page again

@search-php-mobile @skip-login
Scenario: Verify search functionality in mobile view
    Given user logs in and lands on the home page for mobile search validation
    When user sets viewport to mobile size
    Then search icon in mobile view should be visible
    When user clicks on search icon in mobile view
    Then user should land on search result page in mobile view
    When user navigates back to home page in mobile view
    Then user checks if secondary search is visible in mobile view
    When user clicks on the secondary search icon
    Then user should land on search result page in mobile view again

@search-pagination @skip-login
Scenario: Verify pagination and results per page functionality
    Given user logs in and navigates to search page
    Then search results are displayed with pagination
    And default results per page should be "10"
    When user changes results per page to "25"
    Then number of results displayed should be "25"
    When user navigates to page "2"
    Then page "2" should be active in pagination
  
  
