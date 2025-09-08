Feature: Certification Page Validation
  As a user
  I want to access the certification page
  So that I can view certification information
@Certification-page @skip-login
  Scenario: Verify GET CERTIFIED text is displayed on certification page
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    Then user should see "GET CERTIFIED" text in the marquee eyebrow

@Certification-page @skip-login
  Scenario: Verify marquee-cta button href points to certification.adobe.com
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user clicks on the marquee-cta button
    Then user should be redirected to certification.adobe.com

@Certification-page @skip-login
  Scenario: Verify primary media-wrapper CTA button href points to certifications page
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user clicks on first media-wrapper cta button primary
    Then user is navigated to certification certifications page

@Certification-page @skip-login
  Scenario: Verify secondary media-wrapper CTA button href points to courses page
    Given user is logged in to Experience League for certification validation
    When user navigates to certification home page
    And user clicks on first media-wrapper cta button secondary
    Then user is redirected to certification courses page
