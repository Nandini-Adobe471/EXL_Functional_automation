# Test Scenarios: Premium Learning - My Cohorts Block (ExL Homepage)

**Story:** As a Premium Learner enrolled in a cohort, I want to easily access my cohort session and view my progress so I can stay on track and complete my learning program.

**Sprint:** Sprint 8 | ExL Apr 02 - Apr 16  
**Story Points:** 13  
**Priority:** Normal  

---

## 1. Display of Enrolled Cohort Block

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1.1 | User is enrolled in one or more cohorts | "My Cohorts" / enrolled cohort block is displayed on the homepage |
| 1.2 | User has **no enrolled cohorts** | "My Cohorts" block is NOT displayed; "Suggested Cohort" block is displayed instead |
| 1.3 | User is not logged in | Cohort block is not visible (or appropriate fallback shown) |

---

## 2. Cohort Card Display Limit

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 2.1 | User is enrolled in exactly 4 cohorts | All 4 cohort cards are displayed |
| 2.2 | User is enrolled in more than 4 cohorts | Only 4 cohort cards are displayed |
| 2.3 | User is enrolled in fewer than 4 cohorts (e.g., 2) | Only those 2 cards are displayed |

---

## 3. "View All" CTA

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 3.1 | User has enrolled cohorts and "View All" CTA is authored | "View All" CTA is visible |
| 3.2 | User clicks "View All" CTA | User is navigated to the "My Learning" page |
| 3.3 | "View All" CTA is authored to a custom URL | CTA navigates to the authored URL |

---

## 4. Order of Cohort Cards

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 4.1 | User is enrolled in multiple cohorts | Cohorts are displayed in order of enrollment date (earliest first) |
| 4.2 | User enrolls in a new cohort after already having enrolled cohorts | New cohort appears at the appropriate position based on enrollment date |

---

## 5. Navigation Between Cohorts (Arrow Navigation)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 5.1 | User is enrolled in multiple cohorts | Arrow navigation is available to navigate between cohorts |
| 5.2 | User clicks the right arrow | Navigates to the next cohort card/slide |
| 5.3 | User clicks the left arrow | Navigates to the previous cohort card/slide |
| 5.4 | User is on the first cohort | Left arrow is disabled or hidden |
| 5.5 | User is on the last cohort | Right arrow is disabled or hidden |

---

## 6. Overall Progress Display

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 6.1 | User has some progress in enrolled cohort | Overall progress percentage is displayed correctly |
| 6.2 | User has 0% progress | Progress bar shows 0% |
| 6.3 | User has 100% progress | Progress bar shows 100% / completion state |
| 6.4 | Progress data is fetched from API | Progress value matches what is returned from the API |

---

## 7. Week / Module Progress Display

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 7.1 | User is in Week 1 of a cohort | "Week 1 of X" is displayed correctly |
| 7.2 | Modules are remaining in the current week | Number of remaining modules is shown for that week |
| 7.3 | All modules in current week are completed | Week progress reflects completion |
| 7.4 | Terminology label is verified | Label reads "Modules" (NOT "Assignments") — consistent with PL display |

---

## 8. Activity / Replies Section

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 8.1 | User's cohort has discussion replies | "X total replies" count is displayed |
| 8.2 | Text label is verified | Label reads **"X total replies"** (NOT "X new replies since last visit") |
| 8.3 | No replies exist in discussion | Reply count shows 0 or section is hidden gracefully |

---

## 9. Cohort Card Metadata

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 9.1 | Cohort card is displayed | No duration, level, or week metadata is shown (removed per dev note) |
| 9.2 | Due dates are verified | No due dates are shown on cohort cards or modules |

---

## 10. Cohort Card Click / Navigation

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 10.1 | User clicks on a cohort card | User is navigated to the cohort detail page |
| 10.2 | User clicks on an in-progress cohort tile (mobile) | User is navigated to the in-progress cohort detail page |

---

## 11. Mobile View

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 11.1 | User views the cohort section on mobile | In-progress section is **hidden** on mobile (per Raghu's comment) |
| 11.2 | User clicks a cohort tile on mobile | User is navigated to the respective cohort detail page |
| 11.3 | Multiple cohorts exist on mobile | Cards are displayed appropriately (carousel behavior per design) |

---

## 12. No Enrolled Cohorts — Suggested Cohort Block

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 12.1 | User has no enrolled cohorts | Suggested cohort block is shown in place of the enrolled cohort block |
| 12.2 | User enrolls in a cohort after seeing suggested block | Page updates to show the enrolled cohort block |

---

## 13. API / Data Integrity

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 13.1 | API returns cohort data | All cohort cards render with correct data from API |
| 13.2 | API returns error / no data | Graceful fallback — no broken UI elements |
| 13.3 | Locale fields are checked | Locale-related fields are NOT displayed (not available from API per Noor's comment) |

---

## Notes / References

- **Dev Note (Sivaram):** Will display 4 cards. No carousel. Clicking on the card takes the user to the cohort detail. View all link is authored — takes the user to the "My Learning" page.
- **PM Confirmation (Darrien via Raghu):**
  - Use "Modules" language consistent with what PL is displaying (not "Assignments")
  - Remove due dates
  - Update label to "X total replies" instead of "X new replies since last visit"
- **API Limitations (Noor Mohamed):**
  - Assignments → Modules only
  - No due dates available
  - Activity data shows all replies, not specific to last login
  - Locales are not available at this moment
- **Mobile (Raghu):** Hide the in-progress section on mobile view. Clicking on the tile should navigate to the in-progress cohort.
- **PR Reference:** https://github.com/adobe-experience-league/exlm/pull/2608
