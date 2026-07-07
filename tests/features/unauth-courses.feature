Feature: Unauthenticated Courses Page Validation
  As a visitor
  I want to access the courses page without logging in
  So that I can view available courses information

@unauth-courses-page-validation @skip-login
Scenario: Verify Courses page marquee container without login
  Given user navigates to the courses page without login
  Then user should see the marquee container
  And the marquee should have foreground with title and description
  And the marquee should have background with image

@unauth-courses-browse-block @skip-login
Scenario: Verify browse-courses block on courses page without login
  Given user navigates to the courses page without login
  Then user should see the browse-courses block
  And the product filter should be displayed
  And the clear filter button should be disabled
  And the product filter options should match the course card tags

@unauth-courses-product-filter @skip-login
Scenario: Verify product filter functionality on courses page without login
  Given user navigates to the courses page without login
  Then user should see the product filter dropdown
  When user clicks on the product filter button
  Then the product filter dropdown content should be visible
  When user selects a product filter option
  Then the selected product filter should be displayed
  And the clear filter button should be enabled
  And the filtered courses content should be displayed correctly
  When user selects another product filter option
  Then multiple product filters should be displayed
  When user clicks on the clear filters button
  Then all filters should be removed
  And all courses should be displayed

@unauth-course-details-marquee @skip-login
Scenario: Verify course details page when clicking on a course card
  Given user navigates to the courses page without login
  When user clicks on a course card
  Then user should be redirected to the course details page
  And the course marquee should be displayed
  And the course breadcrumb should be visible
  And the breadcrumb should have a link back to courses page
  And the course title in the marquee should match the selected course
  And the course metadata should be displayed
  And the bookmark button should be visible
  When user clicks on the breadcrumb link to courses page
  Then user should be navigated back to the courses page

@unauth-course-breakdown @skip-login
Scenario: Verify course breakdown section in course details page
  Given user navigates to the courses page without login
  When user clicks on a course card
  Then user should be redirected to the course details page
  And the course breakdown section should be displayed
  And the course breakdown header should have a "Sign in to start" button
  And all course breakdown modules should be disabled
  When user clicks on the unauth sign in to start button
  Then user should be redirected to the sign-in page
