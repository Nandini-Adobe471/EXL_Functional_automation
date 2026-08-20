Feature: Header Navigation - extended regression coverage
  # Additional header-only scenarios not already covered by
  # tests/features/header-navigation.feature (which already covers logo/brand
  # visibility, sign-in absence, profile toggle/menu/community section, product grid,
  # Premium Learning nav + redirect, main nav items, Learn-by-Product dropdown +
  # sub-menu, mobile drawer containing Premium Learning, and the language selector
  # popover). Footer scenarios live in footer-validation.feature, not here.
  #
  # Sign-in <-> sign-out toggle and the header search icon are exercised elsewhere
  # (php-extended.feature, unauth-home-page-extended.feature, search-extended.feature)
  # rather than duplicated in this file.

@header-nav-consistency
Scenario: Header navigation is consistent across two different pages
    Given user is logged in and on the Experience League home page
    Then the main nav item labels on this page are recorded
    When user navigates to a second, different page
    Then the main nav item labels on this page should match what was recorded

@header-dropdown-outside-click
Scenario: Learn by Product dropdown closes when clicking elsewhere on the page
    Given user is logged in and on the Experience League home page
    When user clicks the "Learn by Product" nav toggle
    Then the Learn by Product dropdown content should be visible
    When user clicks elsewhere on the page
    Then the Learn by Product dropdown content should be closed

@header-mobile-hamburger-full
Scenario: Mobile hamburger menu reveals and closes the full header
    Given user is logged in and on the Experience League home page
    When user clicks the hamburger menu button
    Then the mobile navigation drawer should be open
    And the mobile drawer body should contain all expected top-level nav items
    When user taps a mobile nav item with sub-items
    Then its sub-items should expand within the drawer
    When user closes the mobile drawer with the close icon
    Then the mobile navigation drawer should be closed
    When user reopens the mobile drawer and taps outside it
    Then the mobile navigation drawer should be closed

@header-language-reload
Scenario: Selecting a different language actually reloads homepage content in that language
    Given user is logged in and on the Experience League home page
    When user selects a non-English language from the header language selector
    Then the page should reload with the locale segment reflecting the new language
    When user switches back to English from the header language selector
    Then the page should revert to the English locale

@header-logo-returns-home
Scenario: Adobe logo click returns to the homepage from a non-homepage page
    Given user is logged in and on the Experience League home page
    When user navigates to a second, different page
    Then user clicks the Adobe logo in the header
    Then the browser should navigate to the homepage

@header-announcement-ribbon-cta
Scenario: Announcement ribbon CTA navigates to its correct linked destination
    Given user is logged in and on the Experience League home page
    And an announcement ribbon with a CTA is visible
    When user clicks the announcement ribbon CTA
    Then the browser should navigate to the ribbon's correct linked destination
