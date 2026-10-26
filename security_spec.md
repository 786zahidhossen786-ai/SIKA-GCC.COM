# Security Specification: Financial Analytics & RBAC Rules

## 1. Data Invariants
1. **User Identity & Role Bound:** Every user document at `/users/{userId}` must have its `userId` field exactly equal to the path `{userId}` and `request.auth.uid`. Role must be one of `['owner', 'manager', 'analyst']`. Standard users cannot escalate their own role to owner unless they are the bootstrapped administrator (`786zahidhossen786@gmail.com`).
2. **Transaction Integrity:** Transactions at `/transactions/{transactionId}` must have a non-negative or strictly numeric `amount`, a valid `type` (`revenue` or `expense`), an ISO-8601 date string `YYYY-MM-DD`, and a matching `userId` corresponding to the authenticating user.
3. **No Phantom Fields:** All incoming write payloads must contain only allowlisted keys matching the schema definitions.
4. **Immutability of Audit Trails:** Document `id`, `userId`, and `createdAt` are immortal and immutable on update.
5. **Role-Based Update & Delete Restrictions:**
   - `owner`: full privileges (create, update, delete).
   - `manager`: can create and update transactions and goals, cannot delete transactions or manage owners.
   - `analyst`: read-only access to transactions, analytics, and goals; cannot create, update, or delete financial records.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Payload 1 (Ghost Field Injection):**
   `{ userId: "user123", email: "user@corp.com", role: "analyst", createdAt: "2026-10-26T00:00:00Z", __isSuperAdmin: true }` -> REJECTED (Unrecognized key).
2. **Payload 2 (Privilege Escalation on Signup):**
   `{ userId: "attacker1", email: "hacker@evil.com", role: "owner", createdAt: "2026-10-26T00:00:00Z" }` by non-bootstrapped email -> REJECTED (Role self-promotion to owner forbidden).
3. **Payload 3 (Transaction Identity Spoofing):**
   `{ userId: "victimUser", type: "expense", category: "Hosting", amount: 5000, date: "2026-10-26", description: "Bribe", createdAt: "2026-10-26T00:00:00Z" }` authored by attacker -> REJECTED (`userId != request.auth.uid`).
4. **Payload 4 (Negative or Nan Currency Attack):**
   `{ userId: "user123", type: "revenue", category: "Sales", amount: -999999, date: "2026-10-26", description: "Drain", createdAt: "2026-10-26T00:00:00Z" }` -> REJECTED (`amount` must be >= 0).
5. **Payload 5 (Oversized Description / Denial of Wallet):**
   `{ userId: "user123", type: "revenue", category: "Sales", amount: 100, date: "2026-10-26", description: <100KB junk text>, createdAt: "..." }` -> REJECTED (`description.size() <= 255`).
6. **Payload 6 (Date Injection Malformed):**
   `{ userId: "user123", type: "expense", category: "Ad", amount: 100, date: "<script>alert(1)</script>", description: "Ad", createdAt: "..." }` -> REJECTED (`date` format regex mismatch).
7. **Payload 7 (Immortal Field Tampering):**
   Update transaction modifying `userId` or original `createdAt` -> REJECTED (`incoming().userId == existing().userId`).
8. **Payload 8 (Analyst Attempting Mutation):**
   Analyst user attempting `setDoc` or `updateDoc` on `/transactions/tx1` -> REJECTED (RBAC write gate).
9. **Payload 9 (Oversized Document ID):**
   `POST /transactions/very_long_junk_id_exceeding_128_chars...` -> REJECTED (`isValidId()` constraint).
10. **Payload 10 (Invalid Transaction Type Enum):**
    `{ type: "crypto_drain", amount: 500, ... }` -> REJECTED (type enum failure).
11. **Payload 11 (Unauthenticated Query):**
    Anonymous unauthenticated client issuing `get` or `list` on `/transactions` -> REJECTED (`request.auth != null`).
12. **Payload 12 (Foreign User Reading Other Tenant Financials):**
    User B listing transactions belonging to User A -> REJECTED (`resource.data.userId == request.auth.uid`).
