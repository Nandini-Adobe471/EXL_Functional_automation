Feature: Media Block for AIM (50/50 block)
  As a content author
  I want to create media blocks with different layout variations
  So that I can display content in a visually appealing 50/50 format

  Background:
    Given user is on the AIM page with media block component

  @media-block-basic @smoke
  Scenario: Verify basic 50/50 media block renders correctly
    When user navigates to page with media block
    Then media block should be visible
    And media block should display image on one side
    And media block should display text content on the other side
    And image and text should be in 50/50 proportion

  @media-block-image-background-removal
  Scenario: Verify media block with background removed blends with page background
    Given user is on page with media block having transparent background
    When user views the media block
    Then image background should be removed
    And image should blend seamlessly with page background
    And no white or colored background should be visible around the image

  @media-block-text-alignment-left
  Scenario: Verify media block with left text alignment
    Given user is on page with media block
    When media block has text alignment set to left
    Then text content should be aligned to the left
    And image should be positioned on the right side
    And layout should maintain 50/50 proportion

  @media-block-text-alignment-right
  Scenario: Verify media block with right text alignment
    Given user is on page with media block
    When media block has text alignment set to right
    Then text content should be aligned to the right
    And image should be positioned on the left side
    And layout should maintain 50/50 proportion

  @media-block-text-alignment-center
  Scenario: Verify media block with center text alignment
    Given user is on page with media block
    When media block has text alignment set to center
    Then text content should be center aligned within its section
    And image should maintain proper positioning
    And layout should maintain 50/50 proportion

  @media-block-responsive-mobile
  Scenario: Verify media block is responsive on mobile devices
    Given user is on page with media block
    When user sets viewport to mobile size
    Then media block should stack vertically
    And image should be displayed above text content
    And both sections should be full width
    And content should remain readable

  @media-block-responsive-tablet
  Scenario: Verify media block is responsive on tablet devices
    Given user is on page with media block
    When user sets viewport to tablet size
    Then media block should maintain appropriate layout
    And image and text proportions should adjust accordingly
    And content should remain accessible

  @media-block-image-quality
  Scenario: Verify media block image loads with proper quality
    Given user is on page with media block
    When media block is rendered
    Then image should load completely
    And image should display in high quality
    And image should not appear pixelated or distorted
    And image alt text should be present for accessibility

  @media-block-text-content
  Scenario: Verify media block text content displays correctly
    Given user is on page with media block
    When media block is rendered
    Then heading text should be visible and properly styled
    And body text should be readable with appropriate font size
    And text should have proper line spacing
    And call-to-action button should be visible if present

  @media-block-interaction
  Scenario: Verify media block interactive elements function correctly
    Given user is on page with media block
    When media block contains clickable elements
    Then links within text should be clickable
    And CTA button should be functional if present
    And clicking should navigate to correct destination
    And hover states should work properly

  @media-block-accessibility
  Scenario: Verify media block meets accessibility standards
    Given user is on page with media block
    When page is analyzed for accessibility
    Then image should have descriptive alt text
    And text should have sufficient color contrast
    And keyboard navigation should work properly
    And screen reader should be able to read content

  @media-block-podcast-variant @priority-high
  Scenario: Verify media block with podcast content (woman in yellow variant)
    Given user is on page with podcast media block
    When media block displays podcast content
    Then image of woman in yellow should be visible
    And podcast title and description should be displayed
    And layout should be 50/50 proportion
    And background should blend properly with page
    And all text should be properly aligned

  @media-block-multiple-instances
  Scenario: Verify multiple media blocks on same page render correctly
    Given user is on page with multiple media blocks
    When page loads completely
    Then all media blocks should render independently
    And each block should maintain its own styling
    And blocks should not interfere with each other
    And page layout should remain structured

  @media-block-content-editor @author-tools
  Scenario: Verify content author can configure media block variations
    Given user is logged in as content author
    When author accesses media block configuration
    Then author should be able to set text alignment
    And author should be able to remove image background
    And author should be able to upload custom images
    And author should see preview of changes
    And author should be able to save configuration

  @media-block-performance
  Scenario: Verify media block loads efficiently
    Given user is on page with media block
    When page performance is measured
    Then media block should load within acceptable time
    And images should be optimized for web
    And lazy loading should be implemented if applicable
    And page speed should not be significantly impacted
