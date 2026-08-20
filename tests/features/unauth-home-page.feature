Feature: Unauthenticated Home Page Validation
  As a visitor
  I want to access the Experience League home page without logging in
  So that I can view the welcome content

@unauth-home-page @skip-login
  Scenario: Verify marquee block is displayed on unauthenticated home page
    Given user navigates to Experience League home page without logging in
    Then user should see the marquee block
    And the marquee block should have the correct structure
    And the marquee eyebrow should contain "WELCOME TO EXPERIENCE LEAGUE"
    And the marquee title should contain "Your home for free learning"
    And the marquee description should be visible
    And the sign in button should be visible and clickable
    And the video background should be present

@unauth-home-page-featurecard @skip-login
  Scenario: Verify featured cards section is displayed on unauthenticated home page
    Given user navigates to Experience League home page without logging in
    Then user should see the featured cards section
    And the featured cards section should have the correct structure
    And the featured cards title should contain "Discover your learning path"
    And the featured cards description should be visible
    
       
@unauth-home-page-iconblock @skip-login
  Scenario: Verify icon block container section is displayed on unauthenticated home page
    Given user navigates to Experience League home page without logging in
    Then user should see the icon block container section
    And the icon block container section should have the heading "Everything you need for growth and learning"
    And the icon block container section should have 4 icon blocks
    And each icon block should have an image
    And each icon block should have a heading
    And each icon block should have a description
    And each icon block should have a link
    And clicking on each icon block link should navigate to the correct page

@UA-01 @skip-login
Scenario: Homepage shows a Sign In control and no personalized content for an unauthenticated visitor
    Given user navigates to Experience League home page without logging in
    Then the header should show a Sign In control instead of a signed-in profile
    And no personalized homepage widgets should be present

@UA-10-redirect @skip-login
Scenario: Marquee Sign in CTA redirects to the Adobe sign-in page
    Given user navigates to Experience League home page without logging in
    When user clicks the marquee sign in CTA without submitting credentials
    Then the browser should land on the Adobe sign-in form

@UA-04 @skip-login
Scenario: Signing in from the homepage returns the user to the homepage
    Given user navigates to Experience League home page without logging in
    When user completes sign in from the homepage marquee with valid credentials
    Then the user should be redirected back to the homepage
    And the header should now show the signed-in profile control

@UA-06 @skip-login
Scenario: Homepage header search works without authentication
    Given user navigates to Experience League home page without logging in
    When user searches from the homepage header without signing in
    Then a search results page should load without any sign-in prompt

@UA-09 @skip-login
Scenario: Homepage language selector functions without authentication
    Given user navigates to Experience League home page without logging in
    When user opens the homepage language selector without signing in
    Then the language selector popover should list English without requiring sign-in

@skip-login
Scenario: Learning, Community and Certification highlight media sections render correctly
    Given user navigates to Experience League home page without logging in
    Then the "Learning" highlight section should show an image, description and "Browse Content" button
    And the "Community" highlight section should show an image, description and "Join the Community" button
    And the "Certification" highlight section should show an image, description and "View Certifications" button

@skip-login
Scenario: Detailed teaser CTA on the homepage prompts sign-in
    Given user navigates to Experience League home page without logging in
    Then the "Ready to accelerate your learning?" teaser should be visible with a Sign in CTA
    When user clicks the teaser sign in CTA without submitting credentials
    Then the browser should land on the Adobe sign-in form

@skip-login
Scenario: Featured cards role and product filters narrow results for an unauthenticated visitor
    Given user navigates to Experience League home page without logging in
    When user applies the first available role filter on the featured cards section
    Then the featured cards results should update to reflect the role filter
    When user applies the first available product filter on the featured cards section
    Then the featured cards results should update to reflect both filters together

@UA-05 @skip-login
Scenario: Bookmarking a featured card prompts sign-in; copying its link does not
    Given user navigates to Experience League home page without logging in
    When user clicks the bookmark icon on the first featured card
    Then a sign-in prompt should appear instead of the bookmark being saved
    When user clicks the copy-link icon on the first featured card
    Then the card's link should be copied without requiring sign-in

@skip-login
Scenario: Featured cards "Browse more" link navigates to the Browse page
    Given user navigates to Experience League home page without logging in
    Then the featured cards "Browse more" link should navigate to the Browse page
