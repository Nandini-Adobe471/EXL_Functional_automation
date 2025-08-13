Feature: Search Facets Functionality

@search-facets-alphabetical @skip-login
Scenario: Verify search facets are alphabetically ordered
    Given user navigates to search page
    Then facet items in "facetRole" should be alphabetically ordered
    And facet items in "facetContentType" should be alphabetically ordered
    And facet items in "facetProduct" should be alphabetically ordered
