# 📋 Baseball Academy Operational SOP Manual

This document serves as the **mandatory operational manual** for the Baseball Academy Operations Platform. It encodes the system logic as human-executeable protocols (SOP) to ensure 100% consistency across staff.

---

## 1. System Overview (Core Logic)
*   **Target Scope**: Ages 10 to Adult | 1x, 2x, or 4-5x per week.
*   **Core Logic**: Automate operations via **Classification Rules + Menu Selection**.
*   **A/B/C/D Framework**: Standardized workout menus (Lower, Upper, Speed, Recovery) matched with athlete levels (L0-L2).
*   **10-Second Safety Rule**: Every session begins with a mandatory status check to mitigate injury risk.
*   **Record Integrity**: Automated data collection of Menu, Level, and Condition (1-5) for every session.

---

## 2. Athlete Classification Protocol
Every athlete must be classified during evaluation using three mandatory inputs:
1.  **Group (Age Band)**: 10-12 | 13-15 | High School (HS) | Adult
2.  **Frequency**: 1x | 2x | 4-5x per week
3.  **Level**:
    *   **L0**: Focus on 폼 (Form), Safety, and foundational movement.
    *   **L1**: Intensity via Dumbbell/Kettlebell-centric resistance.
    *   **L2**: High intensity via Barbell and Power variations.

---

## 3. Session Menu & Template Setup
Sessions depend on the **Workout Selection** and **Duration**.

### Workout Menus (A/B/C/D)
*   **A**: Lower Body Strength & Power
*   **B**: Upper Body Strength, Shoulder Health, Scapular Stability
*   **C**: Speed, Plyometrics, Agility
*   **D**: **Recovery**, Prehab, Mobility, and Core (Mandatory if condition is Bad or Pain exists)

### Drill Categories
Drills are selected from 5 fixed categories:
`MOVEMENT` | `SPRINT` | `JUMP` | `THROWING` | `CONDITIONING`

### Duration Blocks
*   **45 min**: 10m Drill + 30m Workout + 5m Clean
*   **60 min (Standard)**: 15m Drill + 40m Workout + 5m Clean
*   **75 min**: 15m Drill + 50m Workout + 10m Clean

---

## 4. Field Safety Rules (10-Second Check)
Before starting any session, the coach **must** perform a 10-second check:
1.  **Condition**: Good / Normal / Bad
2.  **Pain**: Yes / No
3.  **The "D" Force Rule**:
    *   If **Condition = Bad** OR **Pain = Yes** ➔ **Force Menu D (Recovery)** immediately.
    *   No overrides allowed. Safety first.

---

## 5. Coach Execution Checklist (5 Steps)
1.  **Identity**: Confirm athlete classification on the tablet.
2.  **Safety**: Execute the 10-Second Condition Check.
3.  **Menu**: Confirm the AI-assigned Menu (A/B/C/D) or override if field situation requires.
4.  **Execute**: Guide athletes through the drill sequence (L0-L2 modifications).
5.  **Record**: Mark attendance and confirm the 3 core data points (Menu, Level, Condition).

---

## 6. Record & Quality Management (QA)
1.  **Data Capture**: Every session MUST record [Today's Menu], [Athlete Level], [Condition Score 1-5].
2.  **Re-Evaluation**: Re-evaluate level and status every **4 weeks**.
3.  **Capacity**: Standard group size is 4-8 athletes. Ratio must not exceed 8:1 per coach.
4.  **Priority**: Default to **AI recommendations**. Coaches must record a note if overriding.

---

## 7. Sample Weekly Schedule
*   **Frequency 1x**: Full Body / Movement focus.
*   **Frequency 2x**: Split A (Lower) and Split B (Upper).
*   **Frequency 4-5x**: A -> B -> C -> A -> B (Sequential rotation).

---

## 8. Coach Onboarding (Week 1)
1.  **Day 1**: System architecture & multi-tenancy understanding.
2.  **Day 2**: Hands-on Level (L0-L2) 판정 (Evaluation) practice.
3.  **Day 3**: Running A/B/C/D sessions using the app interface.
4.  **Day 4**: "D" Force Rule & Safety Protocol enforcement.
5.  **Day 5**: Final review of recording accuracy and athlete communication.
