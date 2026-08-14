Feature: Events Page Validation

  @events-block-count-validation
  Scenario: Validate events block is visible and total count matches Coveo API response
    Given user launches the application and logs in for events validation
    When user navigates to the events page
    Then the events search block should be visible
    And the API totalCount should match the UI events and recordings count
    When user sets viewport to mobile size
    Then the events search block should be visible in mobile view
    And the mobile filter toggle should expand filters on click

  @events-product-filter-applied @skip-login
  Scenario: Select first Product filter and verify each result card shows the selected product
    Given user is logged in and on the events page
    When user selects the first option from the Product filter
    Then results count should update
    And each result card should show the selected product or include it in the multisolution tooltip

  @events-series-filter-applied @skip-login
  Scenario: Select first Series filter and verify filtered results are displayed
    Given user is logged in and on the events page
    When user expands the Series filter group
    And user selects the first option from the Series filter
    Then results count should update
    And result cards should be visible

  @events-event-type-filter-applied @skip-login
  Scenario: Select first Event Type filter and verify filtered results are displayed
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the first option from the Event Type filter
    Then results count should update
    And result cards should be visible

  @events-on-demand-filter-card-validation @skip-login
  Scenario: Filter by On Demand event type and validate card structure
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then results count should update
    And each On Demand event card should not have the event time block
    When user clears all filters
    And user expands the Event Type filter group
    And user selects the "Upcoming Events" option from the Event Type filter
    Then results count should update
    And each Upcoming event card should have the event time block
    And each Upcoming event card should not have bookmark or copy link

  @events-marquee-validation @skip-login
  Scenario: Validate marquee section on the events page
    Given user is logged in and on the events page
    Then the marquee block should be visible
    And the marquee heading should contain "With Experience League, learning is an event."
    And the marquee long description should be visible

  @events-announcement-ribbon @skip-login
  Scenario: Validate announcement ribbon is present with submit event CTA
    Given user is logged in and on the events page
    Then the announcement ribbon block should be visible
    And the ribbon heading should contain "Attention Adobe Employees"
    And the ribbon should have a "Submit an event" link that opens in a new tab

  @events-keyword-search @skip-login
  Scenario: Search events using keyword input and validate results update
    Given user is logged in and on the events page
    When user types a keyword in the search input
    Then results count should update
    And result cards should be visible
    And the search input should show the typed keyword

  @events-keyword-search-clear @skip-login
  Scenario: Clear keyword search restores full results
    Given user is logged in and on the events page
    When user types a keyword in the search input
    And user clicks the clear search button
    Then the search input should be empty
    And result cards should be visible

  @events-no-results-search @skip-login
  Scenario: Search with a term that returns no results shows no results message
    Given user is logged in and on the events page
    When user types a search term that returns no results
    Then the no results message should be displayed

  @events-sort-dropdown @skip-login
  Scenario: Validate sort dropdown options and sort by Newest
    Given user is logged in and on the events page
    Then the sort dropdown button should be visible with default label "Relevance"
    When user opens the sort dropdown
    Then the sort dropdown should show options "Relevance", "Popularity", "Newest", "Oldest"
    When user selects sort option "Newest"
    Then the sort dropdown button should display "Newest"
    And result cards should be visible

  @events-grid-list-view-switcher @skip-login
  Scenario: Validate grid and list view switcher toggles view
    Given user is logged in and on the events page
    Then the grid view button should be active by default
    When user switches to list view
    Then the list view button should be active
    And result cards should be visible
    When user switches to grid view
    Then the grid view button should be active

  @events-pagination @skip-login
  Scenario: Validate pagination controls and navigation to next page
    Given user is logged in and on the events page
    Then the pagination section should be visible
    And the pagination should show page "1" and total pages greater than 1
    When user clicks the next page button
    Then the page input should show "2"
    And result cards should be visible

  @events-active-filters-display @skip-login
  Scenario: Active filters are displayed when a filter is applied
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then the active filters container should be visible
    And the active filters container should show the applied filter tag

  @events-clear-all-filters @skip-login
  Scenario: Clear all filters button in filter panel header resets filters
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then results count should update
    When user clicks the clear all filters button in the filter panel
    Then result cards should be visible
    And the active filters container should be hidden

  @events-filter-group-count-badge @skip-login
  Scenario: Filter group header shows count badge when a filter option is selected
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then the Event Type filter group header should show a count badge of "1"

  @events-upcoming-card-location-type @skip-login
  Scenario: Upcoming event cards display location type badge (virtual or in-person)
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "Upcoming Events" option from the Event Type filter
    Then each Upcoming event card should display a location type badge

  @events-upcoming-card-register-cta @skip-login
  Scenario: Upcoming event cards have a Register CTA that opens in a new tab
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "Upcoming Events" option from the Event Type filter
    Then each Upcoming event card should have a Register CTA with new tab icon

  @events-upcoming-card-speaker @skip-login
  Scenario: Upcoming event cards with speakers display speaker profile images
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "Upcoming Events" option from the Event Type filter
    Then upcoming event cards that have speakers should display speaker profile images

  @events-on-demand-card-thumbnail-play @skip-login
  Scenario: On Demand event cards display thumbnail image and play button
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then each On Demand event card that has loaded a thumbnail should display a play button

  @events-on-demand-card-watch-now-cta @skip-login
  Scenario: On Demand event cards have a Watch now CTA
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then each On Demand event card should have a Watch now CTA

  @events-on-demand-card-bookmark-copy @skip-login
  Scenario: On Demand event cards have bookmark and copy link actions
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then each On Demand event card should have bookmark and copy link actions

  @events-multi-filter-combination @skip-login
  Scenario: Applying both Product and Series filters narrows down results
    Given user is logged in and on the events page
    When user selects the first option from the Product filter
    Then results count should update
    When user expands the Series filter group
    And user selects the first option from the Series filter
    Then results count should update
    And result cards should be visible

  @events-keyword-and-filter-combination @skip-login
  Scenario: Keyword search combined with a filter narrows down results
    Given user is logged in and on the events page
    When user expands the Event Type filter group
    And user selects the "On-Demand Events" option from the Event Type filter
    Then results count should update
    When user types a keyword in the search input
    Then result cards should be visible

  @events-upcoming-card-series-banner @skip-login
  Scenario: Upcoming event cards with a series display the event series banner
    Given user is logged in and on the events page
    When user expands the Series filter group
    And user selects the first option from the Series filter
    Then upcoming event cards that have a series banner should display the series name
