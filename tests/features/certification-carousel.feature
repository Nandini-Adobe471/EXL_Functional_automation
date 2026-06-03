Feature: Certification Carousel Block Validation
  As a user
  I want to access the certification home page
  So that I can view the carousel block

@certification-carousel @skip-login
  Scenario: Verify carousel block is visible and in full bleed on certification home page
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user waits for 3 seconds
    Then user should check if carousel block is visible
    And user should verify carousel block is in full bleed with min-width 1200px
    
@certification-carousel-panels @skip-login
  Scenario: Verify number of panels in carousel matches number of navigation buttons
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user waits for 3 seconds
    Then user should check if carousel block is visible
    And user should verify number of panels matches number of navigation buttons
    
@certification-carousel-navigation @skip-login
  Scenario: Verify clicking each navigation button loads the corresponding panel
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user waits for 3 seconds
    Then user should check if carousel block is visible
    And user should verify clicking each button loads the corresponding panel
