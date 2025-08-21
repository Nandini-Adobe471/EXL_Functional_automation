Feature: Search Facets Functionality

@search-facets-alphabetical @skip-login
Scenario: Verify search facets are alphabetically ordered
    Given user navigates to search page
    Then facet items in "facetRole" should be alphabetically ordered
    And facet items in "facetContentType" should be alphabetically ordered
    And facet items in "facetProduct" should be alphabetically ordered

@search-facets-multiple @skip-login
Scenario: Verify multiple facet selection and breadcrumb display
    Given user navigates to search page
    When user selects "Experience Manager" from "Product" facet
    And user selects "Documentation" from "Content Type" facet
    Then all selected facets should appear in the breadcrumb list

@search-facets-multiple-mobile @skip-login
Scenario: Verify multiple facet selection and breadcrumb display on mobile
    Given user navigates to search page in mobile view
    When user selects "Experience Manager" from "Product" facet
    And user selects "Documentation" from "Content Type" facet
    And user clicks on close icon
    Then all selected facets should appear in the breadcrumb list
