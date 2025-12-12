# UX Design Principles for Viralkan App

## Design Principles to Follow

| Law                        | Apply by…                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| Aesthetic-Usability Effect | Use spacing/typography to make forms feel easier                        |
| Hick's Law                 | Avoid clutter; collapse complex settings                                |
| Jakob's Law                | Stick to familiar WP Admin patterns (cards, sidebars, modals)           |
| Fitts's Law                | Place important buttons close, large, clear                             |
| Law of Proximity           | Group logic and inputs with spacing + PanelBody + layout components     |
| Zeigarnik Effect           | Use progress indicators, save states                                    |
| Goal-Gradient Effect       | Emphasize progress in wizards (e.g. New Rule flow)                      |
| Law of Similarity          | Ensure toggles, selectors, filters share styling and layout conventions |
| Miller's Law               | Chunk complex configurations into manageable steps                      |
| Doherty Threshold          | Keep interactions responsive (<400ms) with loading states               |

---

## Detailed Implementation Guidelines

### Aesthetic-Usability Effect

**Core Principle:** Users perceive attractive interfaces as more usable. Visual aesthetics create positive emotional responses that make users more tolerant of minor issues.

**Implementation:**

- **Visual Hierarchy:** Use consistent spacing (e.g. gap-2, px-4) and typography hierarchy (e.g. headings text-lg font-semibold)
- **Visual Polish:** Apply subtle shadows, border separators, and consistent color schemes to improve perceived usability
- **Balance:** Don't sacrifice functionality for aesthetics - use visual design to enhance content, not replace it
- **Research Note:** Watch for mismatches where users praise visual design while struggling with tasks - this indicates the effect masking usability issues

### Hick's Law

**Core Principle:** Decision time increases with the number and complexity of choices presented.

**Implementation:**

- **Progressive Disclosure:** Reduce visible options per screen; show basic settings first, then expand advanced options
- **Collapsible Sections:** Hide complex filters/conditions behind toggles or expandable sections
- **Categorized Choices:** Group related options together (e.g., "Settings," "Advanced," "More Options")
- **Default Selections:** Pre-select common choices to reduce decision fatigue
- **Search & Filter:** For large datasets, provide search functionality instead of listing all options

### Jakob's Law

**Core Principle:** Users prefer familiar patterns and spend most of their time on other sites, so they expect your site to work the same way.

**Implementation:**

- **WordPress Conventions:** Match admin patterns (e.g., table lists with actions, modals for editing, top navigation bar)
- **Icon Placement:** Stick to familiar placement - "Add New" in top-right, status toggles in the row, trash/delete icons aligned consistently
- **Navigation Patterns:** Use familiar interaction patterns (breadcrumbs, sidebars, tab navigation)
- **Mental Models:** When a pattern exists elsewhere in the admin, follow it even if "better" alternatives exist

### Fitts's Law

**Core Principle:** Movement time to a target depends on target size and distance - larger, closer targets are faster to acquire.

**Implementation:**

- **Button Sizing:** Important actions (edit, delete, save) should be large, clearly labeled buttons (minimum 44x44px for touch targets)
- **Proximity Grouping:** Place frequently used controls close together; related sequential actions should be adjacent
- **Screen Edges:** Leverage screen edges as "infinite targets" - place persistent actions (save, cancel) at screen edges or corners
- **Touch Targets:** Never use tiny icon-only buttons (under 24x24px) without text labels unless in a crowded, high-frequency UI
- **Text Labels:** Combine icons with text labels to increase effective target size
- **Spacing:** Maintain adequate spacing between targets (minimum 8px) to prevent mis-clicks

### Law of Proximity

**Core Principle:** Items close together are perceived as related; whitespace indicates separation.

**Implementation:**

- **Strategic Grouping:** Group related controls using containers (PanelBody, Card, spacing utilities)
- **Visual Bundling:** Inputs related to conditions or filters should share visual space with clear boundaries
- **Whitespace Usage:** Use varying amounts of whitespace to separate distinct groups - more space = different function
- **Responsive Consideration:** Ensure grouping logic holds across screen sizes; responsive breakpoints shouldn't break meaningful proximity
- **Tunnel Vision Prevention:** Place related elements within the user's field of view to prevent overlooking important controls

### Zeigarnik Effect

**Core Principle:** People remember incomplete tasks better than completed ones; use this to encourage task completion.

**Implementation:**

- **Progress Indicators:** Show multi-step rule creation progress using steppers, breadcrumbs, or "Step X of Y" counters
- **Save States:** Display save state feedback ("Saving...", "All changes saved", "Unsaved changes" banners)
- **Task Persistence:** Remember incomplete form data across sessions
- **Visual Cues:** Use checkmarks or partial completion indicators for multi-part forms
- **Auto-Save:** Implement auto-save for long forms to prevent data loss anxiety

### Goal-Gradient Effect

**Core Principle:** People work harder as they get closer to a goal; emphasize progress and remaining steps.

**Implementation:**

- **Highlight Current Step:** Emphasize the active step in multi-step workflows with primary button styling or visual emphasis
- **Progress Bars:** Show progress visually (percentage complete, visual progress bars)
- **Remaining Steps:** Display the number of steps left to reduce uncertainty
- **Subgoals:** Break complex workflows into clear subgoals with their own completion feedback
- **Encouragement:** Use positive language and visual rewards (checkmarks, confetti) for completed steps
- **Momentum:** Make the first step(s) particularly easy to build initial momentum

### Law of Similarity

**Core Principle:** Similar elements are perceived as related; use consistent styling to communicate functionality.

**Implementation:**

- **Consistent Components:** Use identical styles for toggles, buttons, badges, and filters across the entire application
- **Icon Consistency:** Maintain uniform icon sizing (16px, 20px, 24px) and style throughout
- **Visual Rhythm:** Align icon and text spacing consistently across all rows and lists
- **Color Semantics:** Use consistent color coding (green = success, red = delete, blue = info, etc.)
- **Interactive States:** Apply consistent hover, active, and disabled states across similar elements

### Miller's Law

**Core Principle:** The average person can hold ~7 items in working memory; chunk information accordingly.

**Implementation:**

- **Information Chunking:** Break complex rule configurations into 3-5 item groups per screen or panel
- **Progressive Disclosure:** Default to collapsed sections (e.g., "advanced options") to reduce cognitive load
- **Mental Models:** Organize options in a way that matches how users think about the task, not how the system works
- **Scannable Lists:** Use bullet points, numbered lists, or formatted groups for multiple related items
- **Hierarchy:** Create clear information hierarchies with headings, subheadings, and content organization

### Doherty Threshold

**Core Principle:** System response times should be under 400ms to maintain user engagement and productivity.

**Implementation:**

- **Performance Targets:** Aim for sub-400ms interactions (instant feedback on clicks, form validation, toggle switches)
- **Loading States:** Use skeletons or shimmer placeholders for content loading, not spinners alone
- **Optimistic UI:** Update UI immediately for predictable actions, then reconcile with server
- **Progressive Enhancement:** Show critical information first, then load additional data
- **Feedback Timing:** Any user action should receive visual feedback within 100ms
- **Background Tasks:** Use spinners for longer operations (>1s), with progress indicators for operations >3s

---

## Implementation Checklist

Before shipping any feature, verify:

- [ ] All interactive elements meet minimum size requirements (44x44px for touch)
- [ ] Related controls are grouped with proper spacing
- [ ] Complex options are collapsed by default
- [ ] Progress is visible in multi-step flows
- [ ] Loading states provide feedback under 400ms
- [ ] Similar elements have consistent styling
- [ ] Visual hierarchy guides user attention
- [ ] Actions follow WordPress admin conventions
- [ ] Important actions are prominently placed
- [ ] Save states are clearly communicated

---

## Key Research Sources

Based on research from:

- Nielsen Norman Group (nngroup.com) - Aesthetic-Usability Effect, Fitts's Law, Law of Proximity
- Laws of UX (lawsofux.com) - UX design principles compilation
- Interaction Design Foundation - Cognitive psychology principles
- Studies from 1995 by Masaaki Kurosu and Kaori Kashimura (Hitachi Design Center)
