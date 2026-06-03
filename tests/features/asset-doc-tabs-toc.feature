Feature: Asset Documentation Tabs and Mini TOC Validation
  As a user of Experience League documentation
  I want to verify the visibility of tabs and correct display of H2 tags in the mini TOC
  So that navigation and content structure are correct

@asset-doc-specific-tabs @skip-login
  Scenario: Validate specific tabs block structure on asset ingestion page
    Given user launches the asset ingestion documentation page
    Then check if the specific tabs block is visible
    And if tabs block exists, verify it contains tab titles and panels
    And if tabs block exists, verify H2 tags under it are not in mini TOC
