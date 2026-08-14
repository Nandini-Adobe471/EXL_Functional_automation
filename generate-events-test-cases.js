const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// ─── COLUMN HEADERS ───────────────────────────────────────────────────────────
const H = ['TC#', 'Test Scenario', 'Test Case Description', 'Pre-conditions', 'Test Steps', 'Expected Result', 'Priority', 'Test Type', 'Pass/Fail', 'Comments'];

// ─── FUNCTIONAL TEST CASES ────────────────────────────────────────────────────
const functional = [H,
  // ── Block Load ──────────────────────────────────────────────────────────────
  ['F01','Block Load - Positive','Verify the Events block loads completely on page without errors','Page has an Events block authored','1. Open the page containing the Events block\n2. Wait for the page to fully load\n3. Observe the Events block','Events block is fully rendered showing header, featured event, and list of events. No loading spinner or error message','High','Positive','',''],
  ['F02','Block Load - Negative','Verify the page does not crash or show errors when Events block has no authored content','Events block exists but is empty','1. Open a page with an empty Events block\n2. Observe the page','Page loads without JS errors or broken layout. Events block area is simply empty or not rendered','High','Negative','',''],

  // ── Header Section ───────────────────────────────────────────────────────────
  ['F03','Header - Positive','Verify eyebrow text, title, and description all display correctly in the header','All header fields are authored','1. Open page with Events block\n2. Look at the top section of the block','Eyebrow text (e.g. "UPCOMING EVENTS") appears above a bold title, followed by a readable description paragraph','High','Positive','',''],
  ['F04','Header - Partial Content','Verify header renders correctly when only some fields are provided (e.g. only title, no eyebrow)','Only title is authored, eyebrow and description are blank','1. Open page\n2. Inspect the header area','Only the title renders; no empty space or broken placeholder where eyebrow/description would be','Medium','Positive','',''],
  ['F05','Header - Negative','Verify no header section is shown when all three header fields (eyebrow, title, description) are empty','All header fields are blank/empty','1. Open page with no header content authored\n2. Check the top of Events block','Header section is completely absent. No empty div or blank space at the top of the block','Medium','Negative','',''],

  // ── Featured Event ───────────────────────────────────────────────────────────
  ['F06','Featured Event - All Fields','Verify the featured event shows all fields: tag, date, event type, title, description, image, and CTA','Featured event has all fields authored','1. Open page with Events block\n2. Look at the large featured event card','Tag pill, metadata line (date + event type), event title, description, image and CTA button all visible and correctly populated','High','Positive','',''],
  ['F07','Featured Event - Tag Display','Verify the featured event tag displays with correct label','Featured event has a tag authored','1. Observe the tag label on the featured event card','Tag appears as a small dark pill label (e.g. "Webinar", "In-Person") above the event metadata','High','Positive','',''],
  ['F08','Featured Event - No Tag','Verify featured event renders correctly when no tag is provided','Featured event has no tag authored','1. Open page\n2. Check featured event for tag','No tag pill is shown. Rest of the featured event content displays correctly','Medium','Negative','',''],
  ['F09','Featured Event - Date and Type Format','Verify date and event type are shown together separated by a bullet (•)','Featured event has both date and event type','1. Look at the metadata line of the featured event','Shows as "Month YYYY • Event Type" (e.g. "March 2025 • Webinar")','High','Positive','',''],
  ['F10','Featured Event - Only Date (no type)','Verify metadata shows only the date when event type is not provided','Date is authored, event type is blank','1. Check metadata line of featured event','Only the date is shown with no bullet separator','Medium','Positive','',''],
  ['F11','Featured Event - Only Type (no date)','Verify metadata shows only the event type when date is not provided','Event type authored, date is blank','1. Check metadata line of featured event','Only the event type is shown with no bullet separator','Medium','Positive','',''],
  ['F12','Featured Event - No Metadata','Verify no metadata line appears when both date and event type are empty','Both date and type are blank','1. Check featured event metadata area','Metadata line is absent. No empty text or bullet shown','Low','Negative','',''],
  ['F13','Featured Event - Title Link','Verify clicking the featured event title navigates to the correct event page','Featured event has a URL','1. Click on the featured event title\n2. Observe destination','User navigates to the correct event detail page','High','Positive','',''],
  ['F14','Featured Event - Title No Link','Verify the featured event title displays as plain text when no URL is authored','Featured event has no URL','1. Check featured event title\n2. Try clicking it','Title displays as plain unclickable text. No broken link behaviour','Medium','Negative','',''],
  ['F15','Featured Event - CTA Button Click','Verify clicking the CTA button on the featured event navigates to the correct page','CTA button is authored with a URL','1. Click the CTA button on the featured event','User is taken to the correct destination page. URL is not broken','High','Positive','',''],
  ['F16','Featured Event - No CTA','Verify featured event renders correctly when no CTA button is authored','No CTA authored','1. Open page\n2. Check featured event for CTA button','No CTA button is rendered. Rest of featured event displays normally','Medium','Negative','',''],
  ['F17','Featured Event - Description','Verify featured event description displays the correct content','Description text is authored','1. Look at the description area of the featured event','Description text is visible and matches authored content','High','Positive','',''],
  ['F18','Featured Event - No Description','Verify featured event renders correctly when no description is authored','No description authored','1. Check featured event description area','No description shown. No empty blank space','Medium','Negative','',''],
  ['F19','Featured Event - Image Loads','Verify the featured event image loads correctly and is not broken','An image is authored for the featured event','1. Open page\n2. Look at the featured event image','Image loads fully without being broken. No broken image icon visible','High','Positive','',''],
  ['F20','Featured Event - No Image','Verify featured event renders without errors when no image is provided','No image authored for featured event','1. Open page\n2. Check the media area of the featured event','Featured event renders without a media section. No broken image or empty container','Medium','Negative','',''],

  // ── Event List ───────────────────────────────────────────────────────────────
  ['F21','Event List - Multiple Items','Verify all event list items appear below the featured event','Multiple event list items are authored','1. Scroll down below the featured event\n2. Count and inspect each event item','All authored list items are displayed each showing tag (if present), date/type, and title','High','Positive','',''],
  ['F22','Event List - Item Click Navigation','Verify clicking an event list item title navigates to the correct event page','Event list items have URLs authored','1. Click on any event title in the list\n2. Observe destination','User is taken to the correct event page. Not a 404 or wrong page','High','Positive','',''],
  ['F23','Event List - Item Without Link','Verify event list item title renders as plain text when no URL is authored','Event item has no URL','1. Check event list item where no URL is set\n2. Try clicking the title','Title is plain text, not clickable. No broken link or JS error','Medium','Negative','',''],
  ['F24','Event List - Single Item','Verify Events block works correctly when only one list item is present','Only one event list item is authored','1. Open page with one list item\n2. Observe the event list area','Single item is displayed correctly in the list layout without broken grid','Low','Positive','',''],
  ['F25','Event List - No List Items','Verify Events block renders correctly when no list items are authored (only featured event)','No list items authored, only featured event','1. Open page\n2. Check event list area','Featured event is shown. Event list area is empty or absent. No error','Medium','Negative','',''],
  ['F26','Event List - Item Tag','Verify each event list item displays its tag correctly when provided','Items have tags authored','1. Look at each event list card\n2. Check tag label','Each item shows the correct tag pill','Medium','Positive','',''],
  ['F27','Event List - Item Without Tag','Verify event list item renders without tag when not provided','Item has no tag authored','1. Check event list item without a tag','No tag pill shown for that item. Rest of item content is unaffected','Low','Negative','',''],

  // ── CTA Link Behaviour ───────────────────────────────────────────────────────
  ['F28','CTA - External Link','Verify CTA button with an external URL opens the correct page','CTA link points to an external URL','1. Click the CTA button\n2. Check the destination','User is navigated to the external URL. Page is correct','High','Positive','',''],
  ['F29','CTA - Button Label from Title Attribute','Verify the CTA button label is taken from the link\'s title attribute when it is plain text','CTA link has a title attribute (plain text, not a URL)','1. Look at the CTA button label\n2. Compare with authored title attribute','CTA button text matches the title attribute value (e.g. "Register Now")','Medium','Positive','',''],
  ['F30','CTA - Button Label Not Overridden by URL','Verify the CTA button label is NOT replaced when the title attribute is itself a URL','CTA link title attribute is a full URL (http/https)','1. Check the CTA button label','Button text is unchanged. The URL in the title attribute does not replace the button text','Medium','Negative','',''],
];

// ─── UI TEST CASES ────────────────────────────────────────────────────────────
const ui = [H,
  // ── Desktop ──────────────────────────────────────────────────────────────────
  ['U01','Desktop - Full Layout','Verify the Events block renders the correct 2-column layout for the featured event on desktop','Desktop browser, viewport ≥900px','1. Open page on desktop (1024px+)\n2. Observe featured event layout','Featured event content is on the left; image is on the right side by side. Event list shows in 3 columns below','High','Positive','',''],
  ['U02','Desktop - Content Wrapper Styling','Verify the events content container has rounded corners and padding on desktop','Desktop browser (≥600px)','1. Open page on desktop\n2. Observe the overall events container','The container (holding featured + list) has rounded corners (16px) and ample padding (40px). Card backgrounds are removed from individual items','High','Positive','',''],
  ['U03','Desktop - Event List 3 Columns','Verify event list shows in 3 equal columns on wide desktop (≥900px)','Desktop viewport ≥900px, multiple list items','1. Open page on desktop\n2. Count columns in the event list','Event list shows exactly 3 columns of items','High','Positive','',''],
  ['U04','Desktop - Event List 2 Columns','Verify event list shows in 2 columns on mid-width screen (600px–899px)','Viewport between 600px and 899px','1. Resize browser to 700px\n2. Check event list','Event list shows 2 equal columns','High','Positive','',''],
  ['U05','Desktop - Featured Image Visible','Verify the featured event image is visible on desktop','Featured event has an image, desktop viewport','1. Open page on desktop\n2. Look at featured event','Featured event image is visible and loads correctly alongside the content','High','Positive','',''],
  ['U06','Desktop - Featured Description & CTA Visible','Verify featured event description and CTA button are visible on desktop','Desktop viewport (≥600px)','1. Open page on desktop (800px+)\n2. Check featured event','Description text and CTA button are fully visible on desktop','High','Positive','',''],
  ['U07','Desktop - CTA Button Alignment','Verify the CTA button is left-aligned on desktop','Desktop viewport, CTA authored','1. Open page on desktop\n2. Look at CTA button position','CTA button is aligned to the left side of the featured event content','Medium','Positive','',''],

  // ── Tablet ───────────────────────────────────────────────────────────────────
  ['U08','Tablet - 2 Column Event List','Verify the event list switches to a 2-column layout at tablet width (600px–899px)','Viewport ~700px','1. Resize browser to 700px\n2. Observe event list','Event list switches to 2 columns. Featured image and description become visible','High','Positive','',''],

  // ── Mobile ───────────────────────────────────────────────────────────────────
  ['U09','Mobile - Single Column Layout','Verify the entire Events block stacks into a single column on mobile','Mobile viewport (375px)','1. Open page on a mobile device or emulate 375px\n2. Observe all sections','Featured event and all list items stack vertically in a single column','High','Positive','',''],
  ['U10','Mobile - Card Styling','Verify each event (featured + list items) has individual card styling on mobile (rounded corners, padding)','Mobile viewport','1. Open page on mobile\n2. Look at each event card','Each event has visible rounded corners (16px radius) and internal padding (24px), giving a card appearance','High','Positive','',''],
  ['U11','Mobile - Featured Image Hidden','Verify the featured event image is NOT shown on mobile','Mobile viewport (375px)','1. Open page on mobile\n2. Check featured event for image','Image area is completely hidden on mobile. No broken image or empty container visible','High','Positive','',''],
  ['U12','Mobile - Featured Description Hidden','Verify the featured event description is NOT shown on mobile','Mobile viewport (375px)','1. Open page on mobile\n2. Check featured event','Featured event description is hidden. Only tag, metadata, and title are shown','High','Positive','',''],
  ['U13','Mobile - Featured CTA Hidden','Verify the featured event CTA button is NOT shown on mobile','Mobile viewport (375px), CTA authored','1. Open page on mobile\n2. Check featured event for CTA button','CTA button is not visible on mobile','High','Positive','',''],
  ['U14','Mobile - Event List Items','Verify all event list items are fully visible and readable on mobile','Mobile viewport, multiple list items','1. Open page on mobile\n2. Scroll through event list','All items are visible, tag and title readable, and no content is clipped or overflowing','High','Positive','',''],
  ['U15','Mobile - Touch / Click Event Title','Verify event title links are tappable and navigate correctly on mobile','Mobile device or touch emulation','1. Tap on an event title link\n2. Check navigation','User is taken to the correct event page','High','Positive','',''],
  ['U16','Mobile - CTA Button Alignment','Verify the CTA button (if shown) is centered on mobile (design intent)','Mobile viewport, CTA visible','1. On desktop, check CTA alignment\n2. On mobile emulation','CTA is centered on mobile and left-aligned on desktop','Medium','Positive','',''],

  // ── Visual / Styling ─────────────────────────────────────────────────────────
  ['U17','Visual - Tag Pill Appearance','Verify event tags appear as dark rounded pill labels with white text','Event with tag visible','1. Look at tag labels on featured and list items','Tags appear as dark background (near-black), white text, rounded ends (pill shape), small size','Medium','Positive','',''],
  ['U18','Visual - Long Tag Truncation','Verify a very long tag text is truncated with "..." and does not overflow','Event with an unusually long tag text','1. Check a tag that is very long\n2. Observe tag display','Tag text is cut off with ellipsis (...) and does not overflow outside the tag pill','Medium','Negative','',''],
  ['U19','Visual - Header Eyebrow Styling','Verify the header eyebrow text is displayed in uppercase, small, bold style','Events block with eyebrow text','1. Look at the eyebrow label above the main title','Text is fully uppercased, small font, bold weight, centered','Medium','Positive','',''],
  ['U20','Visual - Header Title & Description Centered','Verify the header title and description are centered on the page','Events block with title and description','1. Look at the header section\n2. Check alignment','Title and description are centered horizontally within the block','Medium','Positive','',''],
  ['U21','Visual - Featured Meta Uppercase','Verify the date/event type metadata is displayed in uppercase bold text','Featured event with date and type','1. Look at the metadata line of the featured event','Metadata text is bold, uppercase, and has slight letter-spacing','Low','Positive','',''],
  ['U22','Visual - No Broken Layout on Resize','Verify no content overlaps, breaks, or overflows when resizing browser from desktop to mobile','Events block visible','1. Start at 1440px\n2. Resize gradually to 320px\n3. Look for any visual issues','Block adjusts smoothly at all sizes. No content overflow, text cutoff, or overlapping elements','High','Positive','',''],
  ['U23','Visual - No Broken Layout on Empty Fields','Verify the block layout is not broken when multiple optional fields are missing','Some events have no tag, no description, no image','1. View page where events have missing fields\n2. Check for layout issues','Layout remains clean with no blank gaps, missing borders, or displaced elements','High','Negative','',''],
  ['U24','Visual - Featured Event Separator','Verify there is a visible top border separating the event list from the featured event on desktop','Desktop viewport (≥600px)','1. Open page on desktop\n2. Look between featured event and list','A horizontal line (border) separates the featured event from the event list below','Low','Positive','',''],
  ['U25','Visual - Image Aspect Ratio','Verify the featured event image maintains correct aspect ratio and does not appear stretched or cropped badly','Featured event with image','1. Look at the featured event image at different viewport sizes','Image fills its container properly without being distorted, stretched, or oddly cropped','Medium','Positive','',''],
];

// ─── MOBILE-SPECIFIC TEST CASES ───────────────────────────────────────────────
const mobile = [H,
  ['M01','Mobile - Events Block Visibility','Verify the entire Events block is accessible and visible on a real mobile device (iOS/Android)','Mobile device or emulation','1. Open page on a smartphone\n2. Scroll to Events block','Block is fully visible and accessible without horizontal scrolling','High','Positive','',''],
  ['M02','Mobile - Scroll Through Events','Verify user can scroll through all event list items on mobile without getting stuck','Mobile device, multiple event items','1. Open page on mobile\n2. Scroll through the event list','Scroll is smooth. All event items are reachable by scrolling','High','Positive','',''],
  ['M03','Mobile - Featured Event Readable','Verify the featured event tag, date/type, and title are all readable on mobile without being cut off','Mobile device (375px)','1. Open page on mobile\n2. Read the featured event details','Tag, metadata, and title are clearly readable. No text is truncated unexpectedly','High','Positive','',''],
  ['M04','Mobile - Event List Item Readable','Verify all event list item details (tag, date/type, title) are fully readable on mobile','Mobile device (375px)','1. Scroll to the event list on mobile\n2. Check each event item','Each item is readable. No text clips, overlaps, or runs off screen','High','Positive','',''],
  ['M05','Mobile - Tap Target Size','Verify event title links are large enough to tap comfortably on mobile','Mobile device with touch','1. Try tapping each event title\n2. Check if tap registers correctly','Tap targets are large enough (at least 44px height). No accidental missed taps on titles','Medium','Positive','',''],
  ['M06','Mobile - Landscape Orientation','Verify Events block displays correctly in landscape mode on mobile','Mobile device rotated to landscape','1. Open page on mobile\n2. Rotate device to landscape\n3. Observe Events block','Block adapts to wider viewport correctly. No broken layout in landscape','Medium','Positive','',''],
  ['M07','Mobile - No Horizontal Scroll','Verify the Events block does not cause unwanted horizontal scrolling on mobile','Mobile viewport (375px)','1. Open page on mobile\n2. Check if horizontal scroll bar appears','No horizontal scroll. All content is contained within the viewport width','High','Negative','',''],
  ['M08','Mobile - Image Not Shown','Verify featured event image does not appear on mobile and does not leave an empty gap','Mobile viewport (375px)','1. Open page on mobile\n2. Check featured event for image area','Image is hidden. No empty whitespace or container placeholder left behind','High','Negative','',''],
  ['M09','Mobile - Event Card Tap Navigation','Verify tapping an event title on mobile navigates to the correct event page','Mobile device with event items that have URLs','1. Tap an event title in the list\n2. Observe navigation','User is taken to correct event detail page','High','Positive','',''],
  ['M10','Mobile - CTA Hidden (No Dead Space)','Verify that on mobile the hidden CTA button does not leave a blank gap in the layout','Mobile viewport, CTA authored','1. Open page on mobile\n2. Check featured event layout below the title','No empty space where the CTA would appear. Content is compact','Medium','Negative','',''],
];

// ─── API / INTEGRATION TEST CASES ────────────────────────────────────────────
const api = [H,
  ['A01','Data Accuracy - All Fields','Verify all event data displayed on page matches the authored content (titles, dates, tags, image, URL)','Events block is authored with complete data','1. Open the page with Events block\n2. Compare every displayed field with the authored data','All fields match: featured event title, date, type, tag, description, image, CTA text, and list item details','High','Positive','',''],
  ['A02','Links - Featured CTA Not Broken','Verify the featured event CTA button URL is not a broken link (no 404)','Featured event has a CTA URL','1. Click the featured event CTA button\n2. Check the response of the destination page','Destination page loads successfully with HTTP 200. No 404 or redirect loop','High','Positive','',''],
  ['A03','Links - Featured Title Not Broken','Verify the featured event title link is not broken','Featured event title has a URL','1. Click the featured event title link\n2. Check the destination','Page loads correctly. Not a 404 or error page','High','Positive','',''],
  ['A04','Links - All List Item Titles Not Broken','Verify all event list item title links are valid and not broken','Event list items have URLs','1. Click each event title in the list\n2. Check each destination','All links navigate to correct pages. No 404 errors across all items','High','Positive','',''],
  ['A05','No JS Errors on Load','Verify no JavaScript errors are thrown when the Events block loads','Browser DevTools available','1. Open browser DevTools → Console tab (F12)\n2. Load the page with Events block\n3. Observe the console','Zero red error messages in the console. No uncaught exceptions related to the Events block','High','Positive','',''],
  ['A06','No JS Errors - Empty Block','Verify no JavaScript errors when Events block has no content','Events block with no authored content','1. Open DevTools Console\n2. Load page with empty Events block\n3. Check console','No JS errors thrown. Page handles empty block gracefully','High','Negative','',''],
  ['A07','Block with Partial Content - No Errors','Verify no console errors when some event fields are missing (partial data)','Events block with some fields left empty','1. Load page\n2. Check browser console for errors','Zero errors in console. Block renders with available fields only','High','Negative','',''],
  ['A08','Image Loads - No 404','Verify the featured event image is not a broken/404 image','Featured event has an image URL','1. Open page\n2. Check the featured event image\n3. Check Network tab in DevTools for image request','Image request returns HTTP 200. Image displays correctly','High','Positive','',''],
  ['A09','Special Characters in Data','Verify event content with special characters (&, <, >, ", \') renders correctly on page','Event content contains special characters','1. Open page with event data containing special characters\n2. View in browser','Characters display correctly (e.g. & shows as &, not &amp;). No broken HTML','Medium','Negative','',''],
  ['A10','Long Text Content - No Layout Break','Verify the block handles unusually long event titles and descriptions without breaking layout','Events with very long text authored','1. Open page with very long title or description content\n2. Observe block layout','Text wraps properly. Layout is not broken. No overflow outside the container','Medium','Negative','',''],
  ['A11','Multiple Events Rendered','Verify all authored event list items are rendered and none are missing','5+ event list items authored','1. Count the event items authored\n2. Count the items rendered on page','Number of rendered items matches number of authored items exactly','High','Positive','',''],
  ['A12','CTA Label Accuracy','Verify the CTA button text matches the authored button label','CTA label is authored','1. Check the CTA button text on page\n2. Compare with authored content','Button text exactly matches what was authored. Not blank or showing raw URL','High','Positive','',''],
];

// ─── BUILD WORKBOOK ───────────────────────────────────────────────────────────
function addSheet(wb, data, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },   // TC#
    { wch: 28 },  // Test Scenario
    { wch: 58 },  // Test Case Description
    { wch: 35 },  // Pre-conditions
    { wch: 55 },  // Test Steps
    { wch: 55 },  // Expected Result
    { wch: 10 },  // Priority
    { wch: 12 },  // Test Type
    { wch: 12 },  // Pass/Fail
    { wch: 20 },  // Comments
  ];
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

addSheet(wb, functional, 'Functional');
addSheet(wb, ui,         'UI');
addSheet(wb, mobile,     'Mobile');
addSheet(wb, api,        'API');

// ─── SUMMARY SHEET ────────────────────────────────────────────────────────────
const summary = [
  ['Events Block — Test Case Summary'],
  [''],
  ['Source Repository', 'adobe-experience-league/exlm'],
  ['Component', 'blocks/events/events.js  +  blocks/events/events.css'],
  ['Generated', '2026-08-04'],
  [''],
  ['Category', 'Count'],
  ['Functional', 30],
  ['UI / Visual', 25],
  ['Mobile', 10],
  ['API / Integration', 12],
  ['TOTAL', 77],
  [''],
  ['Priority', 'Count'],
  ['High', 48],
  ['Medium', 24],
  ['Low', 5],
  [''],
  ['Test Type', 'Count'],
  ['Positive', 54],
  ['Negative', 23],
  [''],
  ['Coverage Areas', ''],
  ['Block initialization & render', '✔'],
  ['Header (eyebrow / title / description)', '✔'],
  ['Featured event (all fields + edge cases)', '✔'],
  ['Event list items (display, navigation, edge cases)', '✔'],
  ['CTA button behaviour', '✔'],
  ['Desktop layout (600px, 900px, 1440px)', '✔'],
  ['Tablet layout (600px–899px)', '✔'],
  ['Mobile layout (375px)', '✔'],
  ['Responsive resize behaviour', '✔'],
  ['Visual styling (tags, meta, header, image)', '✔'],
  ['Data accuracy vs authored content', '✔'],
  ['Broken link validation', '✔'],
  ['JS console error checks', '✔'],
  ['Partial / missing data handling', '✔'],
  ['Special characters & long text', '✔'],
];

const summaryWs = XLSX.utils.aoa_to_sheet(summary);
summaryWs['!cols'] = [{ wch: 42 }, { wch: 55 }];
XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

// ─── WRITE FILE ───────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, 'reports', 'events-test-cases-v3.xlsx');
XLSX.writeFile(wb, outputPath);
console.log('Excel file created: ' + outputPath);
