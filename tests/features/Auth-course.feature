Feature: Authenticated Courses Page Validation
  As a logged-in user
  I want to access the courses page
  So that I can view available courses information and filters

@auth-courses-page-validation @skip-login
Scenario: Verify Courses page marquee container after login
  Given user logs in to the application
  When user navigates to the courses page
  Then user should see the authenticated marquee container
  And the marquee should have the correct title and description
  And the authenticated marquee should have background with image

@auth-courses-status-filter @skip-login
Scenario: Verify status filter functionality on courses page after login
  Given user logs in to the application
  When user navigates to the courses page
  Then user should see the status filter dropdown
  When user clicks on the status filter button
  Then the status filter dropdown content should be visible
  And status filter dropdown values should match status values in course cards

@auth-course-details @skip-login
Scenario: Verify course details page when clicking on a course card with Not started status
  Given user logs in to the application
  When user navigates to the courses page
  And user clicks on a course card with "Not started" status
  Then user should be redirected to the authenticated course details page
  And the authenticated course breadcrumb should be visible
  And the authenticated course marquee should be displayed
  And the course breakdown heading should have a "Start course" button
  And the first module should have "Start module" button and "Not started" status
  And the remaining modules should have disabled "Start module" buttons

@auth-course-status-change @skip-login
Scenario: Verify course status changes from Not started to In progress after starting the course
  Given user logs in to the application
  When user navigates to the courses page
  And user clicks on a course card with "Not started" status
  Then user should be redirected to the authenticated course details page
  When user clicks on the "Start course" button
  And user navigates back to courses page using breadcrumb
  Then the course status should be changed to "In progress"
  And the course should appear in the in-progress courses section

@auth-inprogress-course @skip-login
Scenario: Verify in-progress course navigation and module status
  Given user logs in to the application
  When user navigates to the courses page
  And user clicks on a course card with "In progress" status in the in-progress section
  Then user should be redirected to the authenticated course details page
  And the course breakdown heading should have a "Continue learning" button
  And the in-progress module should have "Resume module" button and "In progress" status
  When user clicks on the "Resume module" button
  Then user should be redirected to the course step page
  And the module info block should be visible with "BACK TO THE COURSE" button
  And the module info should display the correct module title
  And the step dropdown should be available with the current step selected

@courses-module-filter-navigation @skip-login
Scenario: Navigate through module filter dropdown and verify navigation buttons
  Given user logs in to the application
  When user navigates to the courses page
  Then user should check if course cards are available
  When course cards are available
  Then user clicks on a course card with "Not started" status
  When user clicks on the "Start module" button
  Then user should check for step filter dropdown
  When user clicks on the step filter dropdown button
  Then the step filter dropdown content should be visible
  When user selects a value from the step filter dropdown
  Then user should be redirected to the selected step page
  And user should see appropriate navigation buttons

@module-completion-with-quiz-skip @skip-login
Scenario: Complete a course by skipping quiz using session storage
  Given user logs in to the application
  When user navigates to the courses page
  Then user should add course.skipQuiz key to session storage
  When user clicks on a course card with "Not started" status
  Then user should be redirected to the authenticated course details page
  When user clicks on the "Start course" button
  Then user should be redirected to the course step page
  And user should navigate through steps until "Take quiz" button appears
  When user clicks on the "Take quiz" button
  Then user should see the quiz scorecard with "You passed the quiz!" message

@module-completion-status-verification @skip-login
Scenario: Verify module status changes after completion
  Given user logs in to the application
  When user navigates to the courses page
  Then user should add course.skipQuiz key to session storage
  When user clicks on a course card with "Not started" status
  Then user should be redirected to the authenticated course details page
  When user clicks on the "Start course" button
  Then user should be redirected to the course step page
  And user should navigate through steps until "Take quiz" button appears
  When user clicks on the "Take quiz" button
  Then user should see the quiz scorecard with "You passed the quiz!" message
  When user clicks on the "Back to course overview" button
  Then user should be redirected to the course details page after quiz completion
  And the completed module should have "Completed" status
  And the completed module should have "Review module" button
  And the next module should have enabled "Start module" button

@auth-course-module-count @skip-login
Scenario: Verify module count updates after completing a module
  Given user logs in to the application
  When user navigates to the courses page
  Then user should check the module count on a "Not started" course card
  When user clicks on the selected course card
  And user clicks on the "Start course" button
  And user completes one module
  And user navigates back to courses page using breadcrumb
  Then the module count should be updated in the browse section
  And the module count should be updated in the in-progress section
