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
| 157 | **Full-text Search / Autocomplete** (SQLite FTS5)           | searchlog      | 🔧 📄    | ⬜     |
| 158 | CSV Bulk Import (部分成功・バッチ重複検知)                  | importlog      | 📄       | ⬜     |
| 159 | TOTP 2FA (RFC 6238・HMAC-SHA1・リプレイ防止)                | totplog        | 📄 🔒    | ⬜     |
| 160 | OAuth2 Social Login (Authorization Code Flow・jose)         | oauthlog       | 📄 🔒    | ⬜     |
| 161 | Application Caching (Cache-Aside・TTL・書き込み無効化)      | cachelog       | 📄       | ⬜     |
| 162 | Content Versioning (append-only 履歴・ロールバック)         | contentvlog    | 📄       | ⬜     |
| 163 | Payment Webhook (HMAC検証・冪等・ステータス遷移)            | paymentlog     | 📄       | ⬜     |
| 164 | Geolocation (Haversine・バウンディングボックス)             | geoloclog      | 📄 🔒    | ⬜     |
| 165 | A/B Testing (crc32 決定論的割当・draft→active→stopped)      | ablog          | 📄       | ⬜     |
| 166 | Multi-step Workflow (順序付きステップ・履歴)                | stepflowlog    | 📄       | ⬜     |
| 167 | Inbound Webhook Receiver (per-source HMAC・冪等保存)        | inboundlog     | 📄       | ⬜     |
| 168 | Admin Report Aggregation (日付バリデーション・COALESCE)     | agglog         | 📄 🔒    | ⬜     |
| 169 | Data Masking (default mask・admin unmask・監査ログ)         | masklog        | 📄 🔒    | ⬜     |
| 170 | Request Deduplication (idempotencyMiddleware 活用)          | deduplog       | 📄       | ⬜     |
| 171 | Hierarchical Data (自己参照FK・マテリアライズドパス)        | hierarchylog   | 📄       | ⬜     |
| 172 | Content Scheduling (publish_at・状態機械)                   | pubschedulelog | 📄       | ⬜     |
| 173 | Content Relations (型付きM:N自己参照)                       | relatedlog     | 📄       | ⬜     |
| 174 | Slug Management (SlugHelper・衝突解決・301履歴)             | sluglog        | 📄       | ⬜     |
| 175 | API Usage Metering (per-user クォータ・usage_events)        | meterlog       | 📄       | ⬜     |
| 176 | Delegated Access Grants (multi-party・state machine)        | grantlog       | 📄 🔒    | ⬜     |
| 177 | **Pagination Boundary Attack** (overflow guard・ReDoS)      | limitlog       | 🔧 🔒    | ⬜     |

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
5. `npm run check` green
6. PR → merge → version bump

_Last updated: 2026-05-27_
