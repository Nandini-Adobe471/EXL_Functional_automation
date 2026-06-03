Feature: Search API Content Validation

  @search-api-validation @skip-login
  Scenario: Validate search results match Coveo API response for empty search
    Given user launches the application and logs in for search API validation
    When user navigates to the home page and opens search picker
    And user performs an empty search from search picker
    Then the Coveo search API should be called with organizationId "adobesystemsincorporatednonprod1"
    And the API response results section should match the displayed search results
    And each displayed result title should match the corresponding API result title
    And each displayed result content type should match the corresponding API result el_contenttype
    And each displayed result updated date should match the corresponding API result sysdate
    And the total number of displayed results should match the API totalCount
