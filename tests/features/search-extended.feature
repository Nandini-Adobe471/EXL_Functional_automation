Feature: Search page - extended regression coverage
  # This file only adds scenarios from the manual regression matrix (SRCH-01..SRCH-12)
  # that were NOT already covered by tests/features/search.feature and
  # tests/features/search-api-validation.feature. Those files already cover facet
  # behavior extensively (only-button, parent/child, breadcrumb removal, multiple
  # facets, alphabetical ordering, mobile variants) and pagination/results-per-page,
  # plus a deep API-level validation for an EMPTY search. Do NOT duplicate those here.
  #
  # Also see the accompanying bug report for tests/steps/search.js: the
  # "user changes results per page to {string}" step opens the dropdown but never
  # selects an option, and "user navigates to page {string}" clicks the page-number
  # input without typing into it — the @search-pagination scenario likely cannot
  # actually be passing today.

@SRCH-01
Scenario: Basic search for a real term returns relevant results
    Given user performs a header search for "Analytics"
    Then the results page should show a non-empty list of results relevant to "Analytics"

@SRCH-02
Scenario: Autosuggest suggestions appear when refining a query on the results page
    Given user performs a header search for "Analytics"
    When user types a partial query "test" into the on-page search box without pressing Enter
    Then a dropdown of query suggestions should appear

@SRCH-03
Scenario: Search results for a broad term are grouped and labeled by content type
    Given user performs a header search for "Analytics"
    Then each result should display a content-type label
    And the content-type labels should only be one of the recognized types

@SRCH-05
Scenario: Changing the sort option reorders search results
    Given user performs a header search for "Analytics"
    Then the first few result titles before sorting are recorded
    When user changes the sort option on the search results page
    Then the result order should change to reflect the new sort criterion

@SRCH-07
Scenario: A nonsensical query shows a clear no-results state
    Given user performs a header search for "asdkjhqwlkejhasdkjhqwe12345"
    Then a clear "no results found" message should be displayed
    And a helpful next step should be offered instead of a blank page

@SRCH-08
Scenario: Special character and non-Latin queries do not throw JavaScript errors
    Given user performs a header search for "\"quoted term\""
    Then the results page should load without a JavaScript console error
    Given user performs a header search for "Analytics & Target"
    Then the results page should load without a JavaScript console error
    Given user performs a header search for "分析"
    Then the results page should load without a JavaScript console error

@SRCH-09
Scenario: Search preserves query and facet state across back-navigation
    Given user performs a header search for "Analytics"
    And user applies the first available facet value on the results page
    When user clicks into a search result and navigates back
    Then the search input should still show "Analytics"
    And the previously applied facet should still be active

@SRCH-10
Scenario: Clicking a search result navigates to the exact matching page
    Given user performs a header search for "Analytics"
    When user clicks the first result's title link
    Then the browser should navigate to that exact result's destination page

@SRCH-11
Scenario: Multi-solution content is shown under all of its mapped products
    Given user performs a header search for "Analytics"
    Then a result tagged with more than one product should display all of its mapped products
    When user applies a product facet for one of that result's secondary products
    Then the result should still appear in the filtered list

@SRCH-12
Scenario: Clear All removes every active facet in one action
    Given user performs a header search for "Analytics"
    # Live-verified: the breadbox's aggregate "Clear" control is hidden by design on
    # desktop (atomic-breadbox::part(clear) { display: none } under a
    # min-width:1024px media query) — it only exists in the mobile layout.
    When user changes viewport to mobile
    And the user clicks on the mobile filter button
    And user applies at least two facet values across different facet categories
    When user clicks "Clear" on the search results page
    Then every applied facet should be removed
    And the full unfiltered result set for the query should be restored
