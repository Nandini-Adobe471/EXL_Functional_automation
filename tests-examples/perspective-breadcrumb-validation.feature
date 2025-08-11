Feature: Perspective Page Breadcrumb Validation

@perspective-breadcrumb
Scenario: Validate breadcrumb text matches page heading on redirected page
    Given user logs in and lands on the home page
    When user navigates to the perspectives page for breadcrumb validation
    And user clicks on a card from the authorable-card data block
    Then the breadcrumb span text should match the page heading on redirected page
    # Mobile view testing - staying on the same redirected page
    When user sets viewport to mobile size for breadcrumb validation
    Then the breadcrumb span text should match the page heading on redirected page in mobile view
