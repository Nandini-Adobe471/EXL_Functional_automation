Feature: Slides Functionality
  As a user
  I want to use the slides feature
  So that I can navigate through step-by-step content

@slides-desktop @skip-login
Scenario: Verify slides controls and functionality
  Given the user navigates to the slides page
  When the slides page is fully loaded
  Then the controls div should be visible
  And the next button should be enabled
  And the previous button should be disabled
  And the audio should be muted
  And the autoplay should be enabled
  And the step label should display "Step 1 of" text
  And the slides test should capture a screenshot for evidence

@slides-expand-steps @skip-login
Scenario: Verify expand all steps functionality
  Given the user navigates to the slides page
  When the slides page is fully loaded
  And the step label should display "Step 1 of" text
  And the user clicks on the expand all steps button
  Then the number of active steps should equal the total steps
  And each active step should have the correct step label
  And each active step should have a copy link icon
  And the slides test should capture a screenshot for evidence

@slides-view-as-slides @skip-login
Scenario: Verify view as slides functionality after expanding
  Given the user navigates to the slides page
  When the slides page is fully loaded
  And the user clicks on the expand all steps button
  And the user clicks on the view as slides button
  Then the controls bar should be visible
  And the slides test should capture a screenshot for evidence

@slides-navigation-and-copy-link @skip-login
Scenario: Verify navigation and copy link functionality
  Given the user navigates to the slides page
  When the slides page is fully loaded
  And the user clicks on the next button
  Then the previous button should be enabled
  And the step label value is captured
  When the user clicks on the copy link
  And the copied link is opened in a new window
  Then the step label in the new window should match the captured value
  And the slides test should capture a screenshot for evidence

@slides-mobile-view @skip-login
Scenario: Verify slides functionality in mobile view
  Given the user navigates to the slides page
  When the user sets the viewport to mobile size for slides
  And the slides page is fully loaded
  Then the view as slides button should be visible
  And the controls div should not be visible