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
