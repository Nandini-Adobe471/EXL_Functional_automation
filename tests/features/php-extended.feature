Feature: PHP (Personalized Home Page) - extended regression coverage
  # This file adds scenarios from the manual regression matrix (PHP-01..PHP-13, minus
  # PHP-05/PHP-08 which don't exist in that matrix) that were NOT already covered by
  # tests/features/php.feature.
  #
  # IMPORTANT: unlike php.feature, none of these scenarios use @skip-login. PHP is the
  # signed-in personalized homepage — every scenario here needs the shared authenticated
  # session that hooks.js sets up for non-@skip-login scenarios. (See the accompanying
  # bug report: every scenario in the existing php.feature is tagged @skip-login, which
  # means hooks.js hands it an UNAUTHENTICATED tab before its Given step ever runs, so
  # the `if (!this.page) { await performLogin(this); }` guard in every one of those Given
  # steps is permanently dead code — those tests have never actually exercised the
  # signed-in experience.)
  #
  # Do NOT merge/duplicate into php.feature yet. Once these scenarios are verified
  # stable, merge them in (together with fixing the @skip-login tags there).

@PHP-01
Scenario: Personalized homepage loads with curated content for the signed-in user's profile
    Given user is signed in and on the Experience League homepage
    Then the homepage should not show the generic unauthenticated marquee
    And a curated recommendation section should be visible with cards for the signed-in user
    When user reloads the homepage
    Then the personalized sections should still be visible after reload

@PHP-02
Scenario: Recently viewed / in-progress content shows real progress and resumes correctly
    Given user is signed in and on the Experience League homepage
    And user has at least one in-progress course or tutorial
    When user locates that item in the recommendation marquee
    Then its card should show a progress indicator reflecting how far the user got
    When user clicks that card
    Then the content should resume at the correct position rather than restarting

@PHP-03
Scenario: Recommended content adapts when the user's profile solutions change
    Given user is signed in and on the Experience League homepage
    Then the current recommendation marquee card titles are recorded
    When user changes their selected solution from the Customize your learning page
    And user returns to the homepage
    Then the recommendation marquee card titles should differ from before the profile change

@PHP-04
Scenario: Recommendation marquee "See more" expansion does not skip or duplicate cards
    Given user is signed in and on the Experience League homepage
    Then the recommendation marquee card titles before expansion are recorded
    When user clicks "See more Recommendations" on the recommendation marquee
    Then the additional cards shown should be a distinct, non-duplicated extension of the original set

@PHP-06
Scenario: Announcement ribbon dismissal persists across reloads and pages
    Given user is signed in and on the Experience League homepage
    And an announcement ribbon is visible
    When user dismisses the announcement ribbon
    Then the ribbon should disappear immediately
    When user reloads the homepage
    Then the ribbon should remain dismissed

@PHP-07
Scenario: CTA links on homepage recommendation cards navigate to the correct destination
    Given user is signed in and on the Experience League homepage
    Then clicking a course-type recommendation card should navigate to a matching course page
    And clicking a documentation-type recommendation card should navigate to a matching article
    And clicking a tutorial-type recommendation card should navigate to a matching tutorial page

@PHP-09
Scenario: Homepage personalization is restored correctly after sign-out and sign back in
    Given user is signed in and on the Experience League homepage
    Then the current recommendation marquee card titles are recorded
    When user signs out from the homepage profile menu
    Then the homepage should revert to the unauthenticated state
    When user signs back in with the same account
    Then the recommendation marquee card titles should match what was recorded before sign-out

@PHP-11
Scenario: First card of the recommendation marquee renders at double width
    Given user is signed in and on the Experience League homepage
    Then the first recommendation marquee card should be visibly wider than the other cards

@PHP-12
Scenario: Each recommendation marquee card shows a content-type badge matching its destination
    Given user is signed in and on the Experience League homepage
    Then every visible recommendation marquee card should show a content-type badge
    And each badge should match the type of content its card links to

@PHP-13
Scenario: Premium Learning recommended block reflects the signed-in user's entitlement
    Given user is signed in and on the Experience League homepage
    Then the Premium Learning active content block should reflect the user's real entitlement state
