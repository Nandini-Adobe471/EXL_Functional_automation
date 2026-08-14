@header-navigation
Feature: Header Navigation - Authenticated User

  @header-auth-logo
  Scenario: Authenticated user sees Adobe logo and Experience League brand
    Given user is logged in and on the Experience League home page
    Then the Adobe logo should be visible in the header
    And the Experience League brand link should be visible in the header

  @header-auth-no-sign-in
  Scenario: Authenticated user does not see Sign In link
    Given user is logged in and on the Experience League home page
    Then the Sign In link should not be visible for authenticated user

  @header-auth-profile-toggle
  Scenario: Authenticated user sees profile picture toggle in header
    Given user is logged in and on the Experience League home page
    Then the profile toggle button with profile picture should be visible
    And the sign-in container should have class "signed-in"

  @header-auth-profile-menu
  Scenario: Authenticated user can open profile menu
    Given user is logged in and on the Experience League home page
    When user clicks the profile toggle button
    Then the profile dropdown menu should be visible
    And the profile menu should contain "My learning profile" link
    And the profile menu should contain "Bookmarked content" link
    And the profile menu should contain "Sign out" link

  @header-auth-profile-menu-community
  Scenario: Authenticated user profile menu shows Community section
    Given user is logged in and on the Experience League home page
    When user clicks the profile toggle button
    Then the profile dropdown menu should be visible
    And the profile menu Community section should contain "My Community profile" link
    And the profile menu Community section should contain "Private messages" link
    And the profile menu Community section should contain "Account settings" link

  @header-auth-product-grid
  Scenario: Authenticated user sees product grid (app switcher) button
    Given user is logged in and on the Experience League home page
    Then the product grid button should be visible in the header
    And the product grid container should have class "signed-in"

  @header-auth-product-grid-dropdown
  Scenario: Authenticated user can open product grid dropdown
    Given user is logged in and on the Experience League home page
    When user clicks the product grid button
    Then the product grid dropdown should be visible
    And the product grid dropdown should contain "Adobe Experience Cloud" link
    And the product grid dropdown should contain "Adobe Document Cloud" link

  @header-auth-premium-learning
  Scenario: Authenticated user sees Premium Learning in desktop navigation
    Given user is logged in and on the Experience League home page
    Then the desktop navigation should contain "Premium Learning" link

  @header-auth-nav-items
  Scenario: Authenticated user sees all main navigation items
    Given user is logged in and on the Experience League home page
    Then the main navigation should contain "Learn by Product" menu item
    And the main navigation should contain "Documentation" link
    And the main navigation should contain "AI Training" link
    And the main navigation should contain "Events" link
    And the main navigation should contain "Community" menu item
    And the main navigation should contain "Support" link

  @header-auth-mobile-premium-learning
  Scenario: Authenticated user mobile drawer contains Premium Learning
    Given user is logged in and on the Experience League home page
    When user clicks the hamburger menu button
    Then the mobile navigation drawer should be open
    And the mobile drawer body should contain "Premium Learning" link

  @header-auth-language-selector
  Scenario: Authenticated user can open language selector
    Given user is logged in and on the Experience League home page
    Then the language selector button should be visible in the header
    When user clicks the language selector button
    Then the language selector popover should be visible
    And the language selector should contain English option

  @header-auth-learn-by-product
  Scenario: Authenticated user can expand Learn by Product dropdown
    Given user is logged in and on the Experience League home page
    When user clicks the "Learn by Product" nav toggle
    Then the Learn by Product dropdown content should be visible
    And the dropdown should contain product "Analytics"
    And the dropdown should contain product "Experience Manager"
    And the dropdown should contain product "Journey Optimizer"

  @header-auth-product-sub-menu
  Scenario: Authenticated user can expand a product sub-menu to see content links
    Given user is logged in and on the Experience League home page
    When user clicks the "Learn by Product" nav toggle
    And user clicks the "Analytics" product item toggle
    Then the Analytics sub-menu should be visible
    And the Analytics sub-menu should contain a "Tutorials" link
    And the Analytics sub-menu should contain a "Documentation" link
    And the Analytics sub-menu should contain an "Events" link

  @header-auth-premium-learning-redirect
  Scenario: Clicking Premium Learning redirects authenticated user to /premium/home and header is functional
    Given user is logged in and on the Experience League home page
    When user clicks the "Premium Learning" link in the desktop navigation
    Then the user should be redirected to the premium learning page
    And the header should be visible on the premium learning page
    When user clicks the "Learn by Product" nav toggle
    Then the Learn by Product dropdown content should be visible
