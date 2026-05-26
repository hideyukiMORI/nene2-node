# Field Trial Backlog — FT149–FT177

**Goal:** Reach parity with NENE2 (PHP) FT177 / v1.5.111.  
**Source:** `../NENE2/docs/field-trials/` and `../NENE2/docs/howto/`  
**Policy:** same as existing FT culture — docs-first, one Issue per FT, `npm run check` before merge.

---

## Classification

| Symbol | Meaning                                      |
| ------ | -------------------------------------------- |
| 🔧     | Framework change required (new export / fix) |
| 📄     | How-to doc + brief FT report only            |
| 🔒     | Security / vulnerability diagnosis           |

---

## FT149–FT177

| FT  | Theme                                                       | Dir (NENE2-FT) | Category | Status |
| --- | ----------------------------------------------------------- | -------------- | -------- | ------ |
| 149 | Content Collection (冪等追加・position compact・404 vs 403) | collectionlog  | 📄       | ✅ D0  |
| 150 | Coupon/Promo Code (admin RBAC・state checks・user limit)    | couponlog      | 📄 🔒    | ✅ D0  |
| 151 | Wishlist Management (priority fallback・冪等追加)           | wishlistlog    | 📄       | ✅ D0  |
| 152 | Points/Loyalty System (reference_id 冪等・残高多層防御)     | pointlog       | 📄 🔒    | ✅ D1  |
| 153 | Activity Feed + **Cursor Pagination**                       | feedlog        | 🔧 📄 🔒 | ✅ D1  |
| 154 | Product Review & Rating (1 user × 1 product UNIQUE)         | reviewlog      | 📄       | ✅ D0  |
| 155 | Shopping Cart (数量加算冪等・quantity=0 削除)               | cartlog        | 📄       | ✅ D0  |
| 156 | File Metadata & Sharing (3段階アクセス制御)                 | filelog        | 📄 🔒    | ✅ D0  |
| 157 | **Full-text Search / Autocomplete** (SQLite FTS5)           | searchlog      | 🔧 📄    | ✅ D0  |
| 158 | CSV Bulk Import (部分成功・バッチ重複検知)                  | importlog      | 📄       | ✅ D0  |
| 159 | TOTP 2FA (RFC 6238・HMAC-SHA1・リプレイ防止)                | totplog        | 📄 🔒    | ✅ D0  |
| 160 | OAuth2 Social Login (Authorization Code Flow・jose)         | oauthlog       | 📄 🔒    | ✅ D0  |
| 161 | Application Caching (Cache-Aside・TTL・書き込み無効化)      | cachelog       | 📄       | ✅ D0  |
| 162 | Content Versioning (append-only 履歴・ロールバック)         | contentvlog    | 📄       | ✅ D0  |
| 163 | Payment Webhook (HMAC検証・冪等・ステータス遷移)            | paymentlog     | 📄       | ✅ D0  |
| 164 | Geolocation (Haversine・バウンディングボックス)             | geoloclog      | 📄 🔒    | ✅ D0  |
| 165 | A/B Testing (crc32 決定論的割当・draft→active→stopped)      | ablog          | 📄       | ✅ D0  |
| 166 | Multi-step Workflow (順序付きステップ・履歴)                | stepflowlog    | 📄       | ✅ D0  |
| 167 | Inbound Webhook Receiver (per-source HMAC・冪等保存)        | inboundlog     | 📄       | ✅ D0  |
| 168 | Admin Report Aggregation (日付バリデーション・COALESCE)     | agglog         | 📄 🔒    | ✅ D0  |
| 169 | Data Masking (default mask・admin unmask・監査ログ)         | masklog        | 📄 🔒    | ✅ D0  |
| 170 | Request Deduplication (idempotencyMiddleware 活用)          | deduplog       | 📄       | ✅ D0  |
| 171 | Hierarchical Data (自己参照FK・マテリアライズドパス)        | hierarchylog   | 📄       | ✅ D0  |
| 172 | Content Scheduling (publish_at・状態機械)                   | pubschedulelog | 📄       | ✅ D0  |
| 173 | Content Relations (型付きM:N自己参照)                       | relatedlog     | 📄       | ✅ D0  |
| 174 | Slug Management (SlugHelper・衝突解決・301履歴)             | sluglog        | 📄       | ✅ D0  |
| 175 | API Usage Metering (per-user クォータ・usage_events)        | meterlog       | 📄       | ✅ D0  |
| 176 | Delegated Access Grants (multi-party・state machine)        | grantlog       | 📄 🔒    | ✅ D0  |
| 177 | **Pagination Boundary Attack** (overflow guard・ReDoS)      | limitlog       | 🔧 🔒    | ✅ D1  |

---

## Framework changes identified (🔧)

| FT  | Change                                                                    | Target module                  |
| --- | ------------------------------------------------------------------------- | ------------------------------ |
| 153 | `parseCursorQuery(req, opts)` helper — cursor-based pagination            | `src/http/cursor-query.ts`     |
| 157 | `SqliteFts5QueryExecutor` or docs for Node built-in SQLite FTS5           | `src/database/` or howto only  |
| 177 | Harden `parsePaginationQuery` — integer validation, clamp, overflow guard | `src/http/pagination-query.ts` |

---

## Execution order

Run in FT number order. Each FT:

1. GitHub Issue
2. Branch `ft/NNN-theme`
3. Deliverable: `docs/field-trials/2026-05-field-trial-NNN-theme.md` + `docs/how-to/<pattern>.md` (if new pattern)
4. Framework code + tests (if 🔧)
5. **`npx prettier --write` on all new/modified files before `npm run check`** (format first, always)
6. `npm run check` green
7. PR → merge → version bump

## Campaign rules (AI session)

These rules apply whenever running a multi-FT campaign in a Claude Code session:

### Prettier — always format before check

After creating or editing any file, run:

```sh
npx prettier --write <files>
```

**before** running `npm run check`. Never skip this step — Prettier will fail the check
and waste a round-trip.

### State snapshot — every 3 FTs

After every 3 merged FTs, write the current campaign state to a memory file:

```sh
# In Claude Code — update /root/.claude/projects/.../memory/ft-campaign-state.md
```

Record: last completed FT number, next FT to start, any open friction/blockers.
This ensures context compaction doesn't lose progress.

_Last updated: 2026-05-27_
