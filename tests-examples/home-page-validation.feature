Feature: Adobe Experience League Home Page Validation
  As a user of Adobe Experience League
  I want to ensure the home page functions correctly
  So that I can access learning resources and personalized content

@home-page
Scenario: Verify essential UI elements on the home page
  Given user navigates to Experience League home page
  Then verify the following elements are displayed
    | Element                  |
    | Header navigation        |
    | Search bar               |
    | Hero banner/marquee      |
    | Content cards            |
    | Footer                   |
  And verify the page title is correct

@home-page @search
Scenario: Validate search functionality from home page
  Given user navigates to Experience League home page
  When user enters "Analytics" in the search bar
  And user submits the search
  Then search results page should display
  And search results should contain items related to "Analytics"

@home-page @navigation
Scenario: Verify main navigation links functionality
  Given user navigates to Experience League home page
  When user clicks on each main navigation link
    | Link Name    |
    | Browse       |
    | Perspectives |
    | Events       |
  Then each page should load successfully
  And each page should display relevant content

@home-page @content-cards
Scenario: Validate content card interaction and details
  Given user navigates to Experience League home page
  When user hovers over a content card
  Then card should display hover state
  When user clicks on a content card
  Then the corresponding content detail page should open
  And content details should match the card information

@home-page @personalization @login-required
Scenario: Verify personalized content recommendations for logged-in user
  Given user is logged in to Experience League
  When user navigates to Experience League home page
  Then personalized recommendations section should be visible
  And recommended content should be relevant to user's profile or history
  And user should be able to interact with recommendation controls

@home-page @responsive
Scenario: Validate responsive behavior of home page
  Given user navigates to Experience League home page
  When viewport size is changed to the following dimensions
    | Device      | Width | Height |
    | Mobile      | 375   | 667    |
    | Tablet      | 768   | 1024   |
    | Desktop     | 1440  | 900    |
  Then page layout should adapt appropriately to each viewport
  And all critical elements should remain accessible

@home-page @performance
Scenario: Verify home page performance metrics
  Given user navigates to Experience League home page
  Then page should load within acceptable time threshold
  And core web vitals should meet performance standards
    | Metric                    | Threshold |
    | First Contentful Paint    | < 2.5s    |
    | Largest Contentful Paint  | < 4.0s    |
    | Cumulative Layout Shift   | < 0.1     |
    | First Input Delay         | < 100ms   |
  And images should be properly optimized

@home-page @cookies @analytics
Scenario: Verify data source switching based on cookie preferences
  Given user navigates to Experience League home page
  When user opens cookie preferences from footer
  Then cookie preference options should be displayed
  When user enables all cookie options
  And user saves cookie preferences
  Then content should be served from Target
  When user opens cookie preferences from footer
  And user disables all cookie options
  And user saves cookie preferences
  Then content should be served from Coveo
