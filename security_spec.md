# Firestore Security Spec

## Data Invariants
1. `user_memories`: A memory document must only be created or modified by the user who owns it. The `userId` must strictly match the authenticated user's ID.
2. `resume_versions`: A resume version must strictly belong to the user (`userId == request.auth.uid`). Required fields include `userId`, `name`, `resumeData`, and `timestamp`.
3. `job_searches`: A cached search is publicly readable but must conform strictly to the search schema on create/update.
4. `downloaded_resumes`: A downloaded resume is an immutable record. It can only be created by the authenticated owner, read by the owner, and never updated.
5. `job_applications`: A job application strictly belongs to the user and requires `userId`, `company`, `role`, `status`, and `dateAdded`.
6. Rate Limits: `rate_limits` are tied to the user globally and ensure API bounds.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Create):** Creating a `resume_versions` document where `userId` is set to another user's ID.
2. **Identity Spoofing (Update):** Attempting to modify `userId` on an existing `resume_versions` document to transfer ownership.
3. **Shadow Field Injection:** Attempting to inject `isAdmin: true` into `user_memories`.
4. **Data Type Poisoning:** Updating `resume_versions` with `resumeData` as a large string instead of a map.
5. **Denial of Wallet (Size Violation):** Submitting a `name` array or string in `resume_versions` exceeding 100 characters.
6. **Immutable Field Modification:** Attempting to update a `downloaded_resumes` record after creation.
7. **Privilege Escalation:** Anonymous user trying to write to `system/ai_rate_limit`.
8. **Orphaned Write:** Writing a `resume_version` without the `resumeData` payload.
9. **Role Modification Bypass:** Modifying `status` on `job_applications` to a value outside the enum (`Saved`, `Applied`, `Interviewing`, `Offer`, `Rejected`).
10. **Cross-Tenant Access:** Attempting to read another user's `user_memories`.
11. **Spoofed Timestamps:** Creating a `resume_versions` with `timestamp` set to a future literal instead of `request.time`.
12. **Missing Author:** Creating a `downloaded_resumes` without `userId`.

## The Test Runner
A test runner (`firestore.rules.test.ts`) must be generated to simulate these exact 12 payloads and ensure they all return `PERMISSION_DENIED` except where explicitly allowed.
