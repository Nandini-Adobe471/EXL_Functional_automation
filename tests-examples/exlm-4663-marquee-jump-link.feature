@EXLM-4663 @marquee @jump-link @video-background
Feature: Marquee CTA Jump Link Functionality
  As a user
  I want to click on marquee CTA buttons
  So that I can navigate to specific sections on the same page

  Background:
    Given I am on a page with a marquee component
    And the marquee has been properly configured

  # Title and Description Tests
  @marquee-content @smoke
  Scenario: Marquee displays title and description
    Given the marquee component is authored with a title
    And the marquee component has a description
    When the page loads
    Then the marquee title should be visible
    And the marquee description should be visible
    And the content should be properly styled according to Figma designs

  # CTA Jump Link Functionality
  @cta-primary @jump-link @high-priority
  Scenario: Primary CTA navigates to target section using hash link
    Given the primary CTA is authored with "#section-benefits"
    And there is a section with id "section-benefits" on the page
    When I click on the primary CTA button
    Then the page should scroll to the section with id "section-benefits"
    And the URL should update to include "#section-benefits"
    And the target section should be in the viewport

  @cta-secondary @jump-link @high-priority
  Scenario: Secondary CTA navigates to target section using hash link
    Given the secondary CTA is authored with "#section-pricing"
    And there is a section with id "section-pricing" on the page
    When I click on the secondary CTA button
    Then the page should scroll to the section with id "section-pricing"
    And the URL should update to include "#section-pricing"
    And the target section should be in the viewport

  @cta-both @jump-link
  Scenario: Both primary and secondary CTAs work independently
    Given the primary CTA is authored with "#section-features"
    And the secondary CTA is authored with "#section-contact"
    And both target sections exist on the page
    When I click on the primary CTA button
    Then I should be scrolled to "section-features"
    When I click on the secondary CTA button
    Then I should be scrolled to "section-contact"

  @cta-validation @jump-link
  Scenario Outline: CTA handles various hash link formats
    Given the CTA is authored with "<hash_link>"
    And the target section exists with id "<section_id>"
    When I click on the CTA button
    Then the page should scroll to the target section
    And the scroll behavior should be smooth

    Examples:
      | hash_link           | section_id          |
      | #section-intro      | section-intro       |
      | #SECTION-FEATURES   | SECTION-FEATURES    |
      | #section_about_us   | section_about_us    |
      | #product-2024       | product-2024        |

  @cta-error-handling @jump-link
  Scenario: CTA with invalid hash link shows graceful behavior
    Given the CTA is authored with "#non-existent-section"
    And there is no section with id "non-existent-section" on the page
    When I click on the CTA button
    Then the page should not scroll
    And no JavaScript error should occur
    And the URL should still update to include the hash

  # Desktop Video Tests
  @video-desktop @full-bleed @high-priority
  Scenario: Desktop video displays as full-bleed background
    Given I am viewing the marquee on a desktop device
    And the marquee has a video configured for desktop
    When the page loads
    Then the video should fill the entire marquee container edge to edge
    And the video should have no visible frame or borders
    And the video should have no padding or background gaps
    And the video should not look like an embedded video player
    And the video should feel like a full-bleed background visual

  @video-desktop @autoplay @continuous-loop
  Scenario: Desktop video plays continuously in a loop
    Given I am viewing the marquee on a desktop device
    And the marquee has a video configured for desktop
    When the page loads
    Then the video should start playing automatically
    And the video should be muted by default
    And the video should loop continuously without stopping
    And the video should replay from the beginning when it ends

  @video-desktop @styling
  Scenario: Desktop video maintains seamless visual appearance
    Given I am viewing the marquee on a desktop device
    And the marquee has a video configured for desktop
    When the video is playing
    Then the video should blend seamlessly with the marquee
    And there should be no visible player controls overlay
    And the video should not have a play button overlay
    And the aspect ratio should be maintained

  @video-controls @play-pause @pending
  Scenario: Play/pause button functionality (Pending UX confirmation)
    Given I am viewing the marquee on a desktop device
    And the marquee has a video configured for desktop
    And the play/pause button has been approved by UX team
    When the page loads
    Then a small play/pause button should be visible in the corner
    And the button should be similar to the BACOM site implementation
    When I click the pause button
    Then the video should pause
    And the button should change to a play icon
    When I click the play button
    Then the video should resume playing
    And the button should change to a pause icon

  @video-controls @positioning @pending
  Scenario: Play/pause button is positioned correctly (Pending UX confirmation)
    Given I am viewing the marquee on a desktop device
    And the play/pause button feature is enabled
    When the video is playing
    Then the play/pause button should be in the corner of the marquee
    And the button should not obstruct important content
    And the button should be easily clickable
    And the button should be visible but not distracting

  # Mobile Image Tests
  @image-mobile @responsive @high-priority
  Scenario: Mobile displays image instead of video
    Given I am viewing the marquee on a mobile device
    And the marquee has an image configured for mobile
    When the page loads
    Then the image should be displayed instead of video
    And the image should fill the marquee container edge to edge
    And the image should have no visible frame or borders
    And the image should be properly optimized for mobile

  @image-mobile @styling
  Scenario: Mobile image maintains visual consistency
    Given I am viewing the marquee on a mobile device
    And the marquee has an image configured for mobile
    When the page loads
    Then the image should maintain proper aspect ratio
    And the image should be responsive to screen size
    And the image should feel like a full-bleed background visual
    And the image quality should be appropriate for mobile devices

  # Responsive Behavior Tests
  @responsive @viewport-switching
  Scenario: Switching between desktop and mobile viewports
    Given I am viewing the page on a desktop device
    And the marquee shows a video
    When I resize the browser to mobile viewport
    Then the video should be replaced with the mobile image
    And the marquee should adapt smoothly to the new viewport
    When I resize back to desktop viewport
    Then the video should be displayed again
    And the video should start playing from the beginning

  @responsive @tablet
  Scenario: Marquee displays correctly on tablet devices
    Given I am viewing the marquee on a tablet device
    When the page loads
    Then the appropriate media (video or image) should be displayed based on breakpoint
    And the marquee should fill the viewport appropriately
    And all CTAs should remain functional

  # CTA Styling and Visual Tests
  @cta-styling @figma-designs
  Scenario: Primary and Secondary CTAs are styled according to Figma
    Given the marquee has both primary and secondary CTAs
    When the page loads
    Then the primary CTA should match the Figma design specifications
    And the secondary CTA should match the Figma design specifications
    And both CTAs should be clearly distinguishable from each other
    And the CTA buttons should have proper hover states
    And the CTA buttons should have proper focus states for accessibility

  @cta-layout @positioning
  Scenario: CTAs are positioned correctly within the marquee
    Given the marquee has both primary and secondary CTAs
    When the page loads
    Then the CTAs should be positioned according to Figma designs
    And the spacing between CTAs should be consistent
    And the CTAs should be easily clickable
    And the CTAs should not overlap with other marquee content

  # Content Overlay Tests
  @content-overlay @readability
  Scenario: Text content is readable over video background
    Given I am viewing the marquee on a desktop device
    And the marquee has a video background
    When the page loads
    Then the title text should be clearly readable
    And the description text should be clearly readable
    And there should be sufficient contrast between text and video
    And any text overlay or background should ensure readability

  @content-overlay @mobile
  Scenario: Text content is readable over image background on mobile
    Given I am viewing the marquee on a mobile device
    And the marquee has an image background
    When the page loads
    Then the title text should be clearly readable
    And the description text should be clearly readable
    And there should be sufficient contrast between text and image

  # Performance Tests
  @performance @video-loading
  Scenario: Desktop video loads efficiently
    Given I am viewing the marquee on a desktop device
    When the page loads
    Then the video should start loading immediately
    And the video should not cause significant page load delay
    And the video file size should be optimized
    And the video should use appropriate format and compression

  @performance @image-loading
  Scenario: Mobile image loads efficiently
    Given I am viewing the marquee on a mobile device
    When the page loads
    Then the image should load quickly
    And the image should be properly optimized for mobile bandwidth
    And the image should use responsive image techniques

  # Accessibility Tests
  @accessibility @keyboard-navigation
  Scenario: CTAs are keyboard accessible
    Given the marquee has primary and secondary CTAs
    When I navigate using keyboard Tab key
    Then I should be able to focus on the primary CTA
    And I should be able to focus on the secondary CTA
    When I press Enter on a focused CTA
    Then the jump link should activate and scroll to the target section

  @accessibility @screen-reader
  Scenario: Marquee content is accessible to screen readers
    Given the marquee component is fully authored
    When a screen reader accesses the page
    Then the title should be announced with proper heading level
    And the description should be read aloud
    And the CTAs should have descriptive labels
    And the video should have appropriate ARIA attributes

  @accessibility @video-captions
  Scenario: Video includes accessibility features
    Given the marquee has a video on desktop
    When the video is playing
    Then the video should not have audio (or be muted)
    And the video should not cause motion sensitivity issues
    And users should be able to pause the video if play/pause control is available

  # Edge Cases
  @edge-case @no-video
  Scenario: Marquee handles missing video gracefully
    Given I am viewing the marquee on a desktop device
    And no video has been configured
    When the page loads
    Then a fallback image or solid background color should be displayed
    And the marquee should still function properly
    And no errors should be thrown

  @edge-case @no-image
  Scenario: Marquee handles missing mobile image gracefully
    Given I am viewing the marquee on a mobile device
    And no image has been configured
    When the page loads
    Then a fallback background should be displayed
    And the marquee should still function properly
    And no errors should be thrown

  @edge-case @long-content
  Scenario: Marquee handles long title and description text
    Given the marquee has a very long title
    And the marquee has a very long description
    When the page loads
    Then the text should wrap appropriately
    And the text should remain readable
    And the marquee height should adjust if needed
    And the layout should not break

  @edge-case @multiple-marquees
  Scenario: Multiple marquees on the same page work independently
    Given there are multiple marquee components on the page
    And each marquee has different jump link CTAs
    When I click CTAs on different marquees
    Then each CTA should navigate to its respective target section
    And the marquees should not interfere with each other

  # Smooth Scrolling Behavior
  @scroll-behavior @smooth-scroll
  Scenario: Jump link scrolling is smooth and controlled
    Given the primary CTA has a jump link to "#section-about"
    When I click the primary CTA
    Then the page should scroll smoothly to the target section
    And the scroll animation should take an appropriate duration
    And the target section should be positioned properly in the viewport
    And the scroll should not be jarring or instant

  @scroll-behavior @offset
  Scenario: Jump link accounts for fixed header offset
    Given the page has a fixed header
    And the primary CTA links to "#section-features"
    When I click the primary CTA
    Then the page should scroll to "section-features"
    And the target section should account for the fixed header height
    And the section should not be hidden behind the header

  # Author Experience Tests
  @authoring @cta-configuration
  Scenario: Author can configure both CTAs with hash links
    Given I am authoring the marquee component
    When I configure the primary CTA with label "Get Started" and link "#start"
    And I configure the secondary CTA with label "Learn More" and link "#info"
    Then both CTAs should be saved correctly
    And the preview should show both CTAs
    And clicking CTAs in preview should demonstrate jump link behavior

  @authoring @video-upload
  Scenario: Author can upload and configure desktop video
    Given I am authoring the marquee component
    When I upload a video file for desktop
    Then the video should be properly stored
    And the video should be displayed in the preview
    And the video should auto-play and loop in the preview

  @authoring @image-upload
  Scenario: Author can upload mobile image
    Given I am authoring the marquee component
    When I upload an image file for mobile
    Then the image should be properly stored
    And the image should be displayed in mobile preview
    And the image should maintain proper aspect ratio
