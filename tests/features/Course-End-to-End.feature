Feature: Course End-to-End Flow
  As a logged-in user
  I want to complete a course from start to finish
  So that I can learn new skills and receive a certificate of completion

@course-end-to-end @skip-login
Scenario: Complete a course end-to-end including certificate download
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
  When user clicks on the "Next" button
  Then user should check if redirected to certificate page
  And user should continue to next modules if certificate page is not shown
  Then user should be redirected to the certificate-of-completion page
  And user should see the certificate displayed on the page
  And user should see the "Share with your network" button
  And user should see the "Download" button
  When user clicks on the "Download" button
  Then the certificate should be downloaded successfully
  When user navigates back to the home page
  And user clicks on "Achievements and Awards" link
  Then user should be navigated to awards page
  And user should see the completed course displayed in awards
  And user should see the completion date on the course card
