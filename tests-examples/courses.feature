Feature: Courses Page Validation
  As a user
  I want to access the courses page
  So that I can view available courses

@courses-page-validation @skip-login
Scenario: Verify Courses page navigation and marquee container after login
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the marquee container
  And the marquee container should have an h1 heading "Welcome to Experience League courses"
  And the marquee container should have loaded status

@courses-browse-section @skip-login
Scenario: Verify browse courses section is visible on courses page
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the browse courses block
  And the browse courses block should have an h2 heading "Browse Courses"
  And the browse courses block should display course cards

@courses-product-filter @skip-login
Scenario: Verify product filter functionality on courses page
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the product filter dropdown
  When user clicks on the product filter button
  Then the product filter dropdown content should be visible
  When user selects a random product filter option
  Then the selected product filter should be displayed
  And the filtered courses content should be displayed correctly

@courses-multiple-filters @skip-login
Scenario: Verify multiple filters functionality on courses page
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the product filter dropdown
  When user clicks on the product filter button
  Then the product filter dropdown content should be visible
  When user selects multiple product filter options
  Then the selected product filters should be displayed
  And the filtered courses content should be displayed correctly

@courses-filter-removal @skip-login
Scenario: Verify filter removal functionality on courses page
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the product filter dropdown
  When user clicks on the product filter button
  Then the product filter dropdown content should be visible
  When user selects multiple product filter options
  Then the selected product filters should be displayed
  When user clicks on the close icon of a filter
  Then that filter should be removed
  And the remaining filters should still be displayed

@courses-card-structure @skip-login
Scenario: Verify course card structure and content
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should see the product filter dropdown
  When user selects filters until course cards are visible
  Then the course cards should have the correct structure
  And the course card tag should match a selected filter
  And the course card should have title and description
  And the browse card meta info should be displayed with status
  And the course card footer should have bookmark, copy link, and view course elements

@courses-card-click @skip-login
Scenario: Check course cards availability and click on first card if available
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should check if course cards are available
  When course cards are available
  Then user should click on the first course card
  And user should verify navigation to course page by checking breadcrumb
  When user clicks on the courses link in breadcrumb
  Then user should be redirected to courses landing page

@courses-module-navigation @skip-login
Scenario: Navigate to course module and verify back to course functionality
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should check if course cards are available
  When course cards are available
  Then user should click on the first course card
  When user clicks on the Start Module button if available
  Then user should check if Back to the Course link is available
  When Back to the Course link is available
  Then user should click on Back to the Course link
  And user should be redirected to the course page

@courses-module-filter-navigation @skip-login
Scenario: Navigate through module filter dropdown and verify navigation buttons
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should check if course cards are available
  When course cards are available
  Then user should click on the first course card
  When user clicks on the Start Module button if available
  Then user should check for module filter dropdown
  When user clicks on the module filter dropdown button
  Then the module filter dropdown content should be visible
  When user selects a value from the module filter dropdown
  Then user should be redirected to the selected module page
  And user should see appropriate navigation buttons

@courses-module-steps-verification @skip-login
Scenario: Verify module steps are listed in the dropdown
  Given user is logged in to Experience League for courses validation
  When user navigates to the courses page
  Then user should check if course cards are available
  When course cards are available
  Then user should click on the first course card
  When user clicks on the Start Module button if available
  Then user should extract the base URL and navigate to it
  And user should collect all module steps
  When user navigates back to the original module URL
  Then user should verify all collected steps are in the dropdown
