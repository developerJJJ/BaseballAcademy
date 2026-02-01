# Baseball Academy Operations Platform
### Developer Product Specification (MVP with Scale-Ready Architecture)

## 1. Product Intent / Scope (Background)
*   **Target Age**: 10 years old ~ High School ~ Adult
*   **Frequencies**: 1x / 2x / 4–5x per week
*   **Composition**: 
    *   Training Drills (Skill / Conditioning)
    *   Workouts (Strength / Power / Speed / Recovery)
*   **Primary Goal**: Automated operation via rules + templates, removing coach decision dependency.

### Long-Term Goal
* Support **multiple academies (multi-tenant)**
* Enable franchise-style expansion **without code changes**
* Become a **Vertical ERP for sports academies**

## 2. Core Design Principles (Non-Negotiable)
1. **Features do not vary per academy** → Only configuration and data vary
2. **Rule Engine > Manual Control**
3. **Role-Based Access Control (RBAC) is enforced server-side**
4. **Multi-tenant aware from day one** (even if only one academy exists)
5. **Coaches execute, Admins configure**

## 3. Target Users (Roles)
| Role    | Description                         |
| ------- | ----------------------------------- |
| ADMIN   | Academy owner / director            |
| COACH   | Executes assigned training sessions |
| ATHLETE | Player (Youth / HS / Adult)         |
| PARENT  | Guardian of Youth athlete           |

## 4. Academy Scope (MVP)
* Single academy (hard-coded `academy_id = 1` allowed in MVP)
* Architecture must support multiple academies **without refactoring**
* All tables and services must assume `academy_id` exists

## 5. Core Classification Model (Required Inputs)
Every athlete is classified by **three required fields**:
```text
Level       → L0 | L1 | L2
Frequency   → 1x | 2x | 4–5x per week
Group       → Youth | HS | Adult (or Age Band)
```

## 6. Rule Engine (System Core)
The Rule Engine maps athlete classification → operational output.
### Inputs
* Level, Frequency, Group, Academy policies
### Outputs
* Session template, Drill set, Workout split, Load / recovery constraints

## 7. Session Lifecycle
Athlete Registration -> Classification -> Rule Engine Execution -> Session Template Selection -> Weekly Sessions Auto-Generated -> Coach Executes

## 8. Feature Scope by Role
- **ADMIN**: Configure levels, groups, frequencies, drill/workout libraries, session templates, view metrics.
- **COACH**: View assigned sessions, execute, mark attendance, add notes.
- **ATHLETE**: View today's training, history.
- **PARENT**: View child attendance, monthly summary, level changes.

## 9. What Coaches CANNOT Do
- Change athlete level/frequency, modify templates, create custom sessions, override rules.

## 10. Multi-Tenancy Strategy
- `academy_id` on all core tables. Resolved during auth.

## 11. MVP Technical Expectations
- Backend: Central API server, strong domain modeling, transaction consistency, Rule Engine.
- Frontend: Web (Admin/Coach), Mobile-first UI (Athlete/Parent).
