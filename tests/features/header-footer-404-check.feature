Feature: Header and Footer Link 404 Validation
  As a QA engineer
  I want to validate all header and footer links on the Experience League review site
  So that I can identify any broken links returning 404 responses

@header-footer-404 @skip-login
  Scenario: Collect and validate all header links for 404 errors
    Given user launches the Experience League review home page
    Then user collects all links present in the header navigation
    And user checks each header link for a 404 response
    And user reports all header links returning 404

@header-footer-404 @skip-login
  Scenario: Collect and validate all footer links for 404 errors
    Given user launches the Experience League review home page
    Then user collects all links present in the footer
    And user checks each footer link for a 404 response
    And user reports all footer links returning 404
