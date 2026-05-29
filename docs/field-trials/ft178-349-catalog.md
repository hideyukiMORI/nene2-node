# FT178–349 Catalog — upstream parity triage

**Created:** 2026-05-29
**Source spine:** `../NENE2/docs/howto/ft-registry.md` (FT186–311) + `../NENE2/CHANGELOG.md` `[Unreleased]` (FT312–349)
**Upstream status:** PHP NENE2 declared "全 FT カバー達成" at FT349 (~v1.5.323)
**node status:** FT177 / v0.1.25

> This is a **triage catalog, NOT an execution backlog.** Per `docs/scope.md`
> (Out of scope: _"High-volume PHP howto FT loop (100+ apps)"_, _"Application-specific
> domain logic"_) and `docs/roadmap.md` (_"no 165+ PHP FT apps copied verbatim"_),
> node does **not** mirror PHP FTs 1:1. node FTs are **optional and selective**, chosen
> by one axis: **does the trial verify node runtime behaviour against the PHP/OpenAPI
> contract?** — not "does node have the same app?".

---

## Key findings

- The "FT178–349 = 172 themes" premise is **wrong**. The real number of distinct
  howto-bearing themes in that band is **108** — the remaining numbers are ATK/VULN
  re-passes or have no howto.
- **Framework porting is almost unnecessary.** Of 108, only **5** are genuine node
  framework gaps (🔧new). Most security parity FTs reuse existing primitives.

## Triage summary (108 themes)

| Verdict     | Count | Meaning                                                               |
| ----------- | ----- | --------------------------------------------------------------------- |
| ⏭ skip     | 62    | Pure app-domain — out of scope (consumer repos / PHP sandboxes)       |
| ✅ already  | 22    | node already has an equivalent how-to (incl. naming drift)            |
| 🎯 do 🔒    | 13    | Security/contract FT worth running against node runtime               |
| 🎯 do 📄    | 6     | Framework primitive **exists** in node; only the FT/how-to is missing |
| 🎯 do 🔧new | 5     | Genuine framework gap — needs new node code                           |

**Actionable node FT178+ scope = the 24 `do` rows** (and realistically the 18 🔒/🔧new
are the priority; the 6 📄 are doc-only catch-ups).

---

## 🎯 do 🔧new — genuine framework gaps (5)

| FT    | PHP howto                      | type | note                                                                  |
| ----- | ------------------------------ | ---- | --------------------------------------------------------------------- |
| FT288 | `distributed-lock.md`          | ATK  | 分散ロック：node に該当プリミティブ無し                               |
| FT298 | `circuit-breaker.md`           | 通常 | サーキットブレーカ：node に該当プリミティブ無し                       |
| FT307 | `etag-conditional-requests.md` | 通常 | ✅ **done → node FT178** (`src/http/conditional-request.ts`, v0.1.26) |
| FT322 | `nested-json-validation`       | 通常 | ネスト JSON バリデーション：V ヘルパー相当が未実装                    |
| FT326 | `patch-partial-update`         | 通常 | PATCH 部分更新：マージセマンティクス未実装                            |

## 🎯 do 🔒 — security / contract parity (13)

| FT    | PHP howto                       | type | note                                                        |
| ----- | ------------------------------- | ---- | ----------------------------------------------------------- |
| FT256 | `mass-assignment-defence.md`    | ATK  | mass assignment 防御（入力バインド境界）                    |
| FT264 | `sql-injection-defence.md`      | ATK  | SQL インジェクション防御（パラメタライズド徹底の検証）      |
| FT267 | `encrypted-field-storage.md`    | VULN | フィールド暗号化（鍵分離・nonce・タグ検証）                 |
| FT279 | `rbac-jwt-auth.md`              | VULN | RBAC + JWT 認可境界                                         |
| FT280 | `account-lockout.md`            | ATK  | アカウントロックアウト（ブルートフォース耐性）              |
| FT285 | `password-reset-flow.md`        | VULN | パスワードリセットフロー（トークン安全性）                  |
| FT290 | `otp-authentication.md`         | ATK  | OTP 認証（タイミング・リプレイ）                            |
| FT318 | `tenant-isolation-idor`         | 通常 | テナント隔離 IDOR（クロステナント 404）                     |
| FT331 | `password-auth-argon2id`        | 通常 | argon2id パスワード認証（ハッシュ方針）                     |
| FT337 | `url-shortener-ssrf-prevention` | 通常 | URL 短縮 SSRF 防止（プライベートIP/スキーム制限）           |
| FT341 | `dynamic-sort-order-injection`  | 通常 | ✅ **done → node FT179** (`parseSortQuery` + ft179 sandbox) |
| FT342 | `jwt-tenant-isolation`          | 通常 | JWT マルチテナント隔離（tenant_id クレーム）                |
| FT345 | `unicode-aware-text-api`        | VULN | Unicode テキスト検証（mb 計数・Null バイト拒否）            |

## 🎯 do 📄 — framework exists, FT/how-to only (6)

| FT    | PHP howto                           | node primitive (existing)                                        |
| ----- | ----------------------------------- | ---------------------------------------------------------------- |
| FT251 | `fixed-window-rate-limiter.md`      | throttle 実装済（fixed-window 角度の FT/doc のみ）               |
| FT253 | `transaction-scope-pattern.md`      | run-transaction 実装済（scope パターン FT/doc のみ）             |
| FT260 | `webhook-signature-verification.md` | webhook-signature middleware 実装済（FT/doc のみ）               |
| FT273 | `bearer-token-middleware.md`        | bearer-token verifier 実装済（middleware FT/doc のみ）           |
| FT276 | `idempotency.md`                    | idempotency middleware 実装済（CSRF/二重送信角度の FT/doc のみ） |
| FT323 | `optimistic-concurrency-version`    | optimistic-concurrency.ts 実装済（version FT/doc のみ）          |

## ✅ already — node ↔ PHP naming map (22)

PHP slugs that already have a node how-to under a (sometimes different) name.
This table is the deduplication ledger — do **not** re-create these as new FTs.

| FT    | PHP howto                    | node how-to                        |
| ----- | ---------------------------- | ---------------------------------- |
| FT242 | `cursor-pagination.md`       | `cursor-pagination.md`             |
| FT245 | `aggregate-reporting.md`     | `admin-report-aggregation.md`      |
| FT247 | `step-workflow-approval.md`  | `multi-step-workflow.md`           |
| FT249 | `article-versioning-api.md`  | `content-versioning.md`            |
| FT254 | `sqlite-fts5-search.md`      | `full-text-search-autocomplete.md` |
| FT269 | `shopping-cart-api.md`       | `shopping-cart.md`                 |
| FT277 | `activity-feed.md`           | `activity-feed.md`                 |
| FT282 | `delegated-access-grants.md` | `delegated-access-grants.md`       |
| FT292 | `idempotency-key.md`         | `request-deduplication.md`         |
| FT293 | `ab-testing.md`              | `ab-testing.md`                    |
| FT296 | `geolocation-api.md`         | `geolocation.md`                   |
| FT297 | `pii-masking.md`             | `data-masking.md`                  |
| FT299 | `collection-api.md`          | `content-collection.md`            |
| FT300 | `point-ledger-api.md`        | `point-loyalty-system.md`          |
| FT302 | `coupon-discount-api.md`     | `coupon-promo-code.md`             |
| FT303 | `file-sharing-api.md`        | `file-metadata-sharing.md`         |
| FT317 | `inbound-webhook-gateway`    | `inbound-webhook-receiver.md`      |
| FT319 | `pagination-limit-injection` | `pagination-boundary-attack.md`    |
| FT325 | `offset-cursor-pagination`   | `cursor-pagination.md`             |
| FT330 | `scheduled-publish-article`  | `content-scheduling.md`            |
| FT334 | `article-relations-api`      | `content-relations.md`             |
| FT344 | `category-hierarchy-api`     | `hierarchical-data.md`             |

---

## Full catalog (108 rows)

Spine in FT order. `type` is the PHP registry tag (ATK / VULN / 通常).

| FT    | PHP project        | PHP howto                            | type | node how-to                   | verdict     | note                                                             |
| ----- | ------------------ | ------------------------------------ | ---- | ----------------------------- | ----------- | ---------------------------------------------------------------- |
| FT186 | sessionlog         | `session-management.md`              | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT188 | verifylog          | `numeric-verification-code.md`       | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT189 | consentlog         | `privacy-consent-management.md`      | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT190 | announcelog        | `system-announcement-management.md`  | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT233 | cqrslog            | `cqrs-pattern.md`                    | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT234 | creditslog         | `credit-ledger.md`                   | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT235 | reminderlog        | `scheduled-reminders.md`             | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT236 | quotalog           | `quota-management.md`                | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT237 | statemachinelog    | `state-machine-audit-log.md`         | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT238 | contactlog         | `contact-management.md`              | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT239 | doclog             | `document-versioning.md`             | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT240 | noteslog           | `note-management-ownership.md`       | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT242 | cursorlog          | `cursor-pagination.md`               | 通常 | cursor-pagination             | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT243 | statslog           | `event-analytics-api.md`             | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT244 | budgetlog          | `budget-tracking.md`                 | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT245 | agglog             | `aggregate-reporting.md`             | 通常 | admin-report-aggregation      | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT246 | timelog            | `time-tracking.md`                   | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT247 | stepflowlog        | `step-workflow-approval.md`          | 通常 | multi-step-workflow           | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT248 | flowlog            | `content-approval-workflow.md`       | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT249 | contentvlog        | `article-versioning-api.md`          | VULN | content-versioning            | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT250 | tagfilterlog       | `multi-value-tag-filter.md`          | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT251 | ratelimitlog       | `fixed-window-rate-limiter.md`       | 通常 | —                             | 🎯 do 📄    | throttle 実装済（fixed-window 角度の FT/doc のみ）               |
| FT252 | pinverifylog       | `pin-verification-lockout.md`        | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT253 | txlog              | `transaction-scope-pattern.md`       | 通常 | —                             | 🎯 do 📄    | run-transaction 実装済（scope パターン FT/doc のみ）             |
| FT254 | ftslog             | `sqlite-fts5-search.md`              | 通常 | full-text-search-autocomplete | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT255 | queuelog           | `job-queue-with-retry.md`            | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT256 | masslog            | `mass-assignment-defence.md`         | ATK  | —                             | 🎯 do 🔒    | mass assignment 防御（入力バインド境界）                         |
| FT257 | softdeletelog      | `soft-delete-trash-purge.md`         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT258 | bulklog            | `bulk-operations-partial-success.md` | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT259 | scorelog           | `leaderboard-ranking-api.md`         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT260 | hmaclog            | `webhook-signature-verification.md`  | ATK  | —                             | 🎯 do 📄    | webhook-signature middleware 実装済（FT/doc のみ）               |
| FT261 | jwtlog             | `jwt-authentication.md`              | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT262 | moneylog           | `multi-currency-money-ledger.md`     | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT263 | reactionlog        | `emoji-reactions-toggle.md`          | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT264 | injectionlog       | `sql-injection-defence.md`           | ATK  | —                             | 🎯 do 🔒    | SQL インジェクション防御（パラメタライズド徹底の検証）           |
| FT265 | linklog            | `url-bookmark-api.md`                | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT266 | apikeylog          | `api-key-management.md`              | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT267 | encryptlog         | `encrypted-field-storage.md`         | VULN | —                             | 🎯 do 🔒    | フィールド暗号化（鍵分離・nonce・タグ検証）                      |
| FT268 | auditlog           | `audit-trail.md`                     | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT269 | cartlog            | `shopping-cart-api.md`               | 通常 | shopping-cart                 | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT270 | featureflaglog     | `feature-flags.md`                   | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT271 | notificationlog    | `notification-inbox.md`              | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT272 | tokenlog           | `token-lifecycle-api.md`             | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT273 | authlog            | `bearer-token-middleware.md`         | VULN | —                             | 🎯 do 📄    | bearer-token verifier 実装済（middleware FT/doc のみ）           |
| FT274 | orderlog           | `order-management.md`                | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT275 | profilelog         | `user-profile-api.md`                | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT276 | csrflog            | `idempotency.md`                     | ATK  | —                             | 🎯 do 📄    | idempotency middleware 実装済（CSRF/二重送信角度の FT/doc のみ） |
| FT277 | feedlog            | `activity-feed.md`                   | 通常 | activity-feed                 | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT278 | messagelog         | `direct-messaging-system.md`         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT279 | rbaclog            | `rbac-jwt-auth.md`                   | VULN | —                             | 🎯 do 🔒    | RBAC + JWT 認可境界                                              |
| FT280 | lockoutlog         | `account-lockout.md`                 | ATK  | —                             | 🎯 do 🔒    | アカウントロックアウト（ブルートフォース耐性）                   |
| FT281 | refreshlog         | `refresh-token-pattern.md`           | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT282 | grantlog           | `delegated-access-grants.md`         | 通常 | delegated-access-grants       | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT283 | invitelog          | `invitation-system.md`               | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT284 | throttlelog        | `rate-limiting.md`                   | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT285 | resetlog           | `password-reset-flow.md`             | VULN | —                             | 🎯 do 🔒    | パスワードリセットフロー（トークン安全性）                       |
| FT286 | schedulelog        | `timezone-aware-scheduling.md`       | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT287 | waitlistlog        | `waitlist-system.md`                 | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT288 | distlocklog        | `distributed-lock.md`                | ATK  | —                             | 🎯 do 🔧new | 分散ロック：node に該当プリミティブ無し                          |
| FT289 | reportlog          | `content-reporting.md`               | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT290 | otplog             | `otp-authentication.md`              | ATK  | —                             | 🎯 do 🔒    | OTP 認証（タイミング・リプレイ）                                 |
| FT291 | grouplog           | `group-member-management.md`         | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT292 | deduplog           | `idempotency-key.md`                 | ATK  | request-deduplication         | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT293 | ablog              | `ab-testing.md`                      | 通常 | ab-testing                    | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT294 | batchlog           | `batch-api-partial-success.md`       | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT295 | bookmarklog        | `bookmark-api.md`                    | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT296 | geoloclog          | `geolocation-api.md`                 | ATK  | geolocation                   | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT297 | masklog            | `pii-masking.md`                     | VULN | data-masking                  | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT298 | circuitlog         | `circuit-breaker.md`                 | 通常 | —                             | 🎯 do 🔧new | サーキットブレーカ：node に該当プリミティブ無し                  |
| FT299 | collectionlog      | `collection-api.md`                  | 通常 | content-collection            | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT300 | pointlog           | `point-ledger-api.md`                | ATK  | point-loyalty-system          | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT301 | contentlog         | `content-negotiation-api.md`         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT302 | couponlog          | `coupon-discount-api.md`             | 通常 | coupon-promo-code             | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT303 | filelog            | `file-sharing-api.md`                | VULN | file-metadata-sharing         | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT304 | salelog            | `flash-sale-api.md`                  | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT305 | draftlog           | `draft-publish-workflow.md`          | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT306 | emojilog           | `emoji-reactions-api.md`             | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT307 | etaglog            | `etag-conditional-requests.md`       | 通常 | —                             | 🎯 do 🔧new | ETag 条件付きリクエスト：node に未実装（HTTP 挙動パリティ）      |
| FT308 | webhookdeliverylog | `webhook-delivery-system.md`         | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT309 | magiclog           | `magic-link-authentication.md`       | VULN | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT310 | eventsourcelog     | `event-sourcing-ledger.md`           | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT311 | expenselog         | `expense-tracking-api.md`            | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT312 | —                  | `data-export-api`                    | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT313 | —                  | `feature-flag-api`                   | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT314 | —                  | `follow-api`                         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT317 | —                  | `inbound-webhook-gateway`            | 通常 | inbound-webhook-receiver      | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT318 | —                  | `tenant-isolation-idor`              | 通常 | —                             | 🎯 do 🔒    | テナント隔離 IDOR（クロステナント 404）                          |
| FT319 | —                  | `pagination-limit-injection`         | 通常 | pagination-boundary-attack    | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT322 | —                  | `nested-json-validation`             | 通常 | —                             | 🎯 do 🔧new | ネスト JSON バリデーション：V ヘルパー相当が未実装               |
| FT323 | —                  | `optimistic-concurrency-version`     | 通常 | —                             | 🎯 do 📄    | optimistic-concurrency.ts 実装済（version FT/doc のみ）          |
| FT325 | —                  | `offset-cursor-pagination`           | 通常 | cursor-pagination             | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT326 | —                  | `patch-partial-update`               | 通常 | —                             | 🎯 do 🔧new | PATCH 部分更新：マージセマンティクス未実装                       |
| FT329 | —                  | `user-preferences-api`               | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT330 | —                  | `scheduled-publish-article`          | 通常 | content-scheduling            | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT331 | —                  | `password-auth-argon2id`             | 通常 | —                             | 🎯 do 🔒    | argon2id パスワード認証（ハッシュ方針）                          |
| FT334 | —                  | `article-relations-api`              | 通常 | content-relations             | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT335 | —                  | `resource-reservation-booking`       | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT337 | —                  | `url-shortener-ssrf-prevention`      | 通常 | —                             | 🎯 do 🔒    | URL 短縮 SSRF 防止（プライベートIP/スキーム制限）                |
| FT338 | —                  | `signed-url-download`                | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT341 | —                  | `dynamic-sort-order-injection`       | 通常 | —                             | 🎯 do 🔒    | ORDER BY インジェクション防止（allowlist・ReDoS 耐性）           |
| FT342 | —                  | `jwt-tenant-isolation`               | 通常 | —                             | 🎯 do 🔒    | JWT マルチテナント隔離（tenant_id クレーム）                     |
| FT343 | —                  | `threaded-comments-api`              | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT344 | —                  | `category-hierarchy-api`             | 通常 | hierarchical-data             | ✅ already  | 既存 how-to に同等（命名差含む）                                 |
| FT345 | —                  | `unicode-aware-text-api`             | VULN | —                             | 🎯 do 🔒    | Unicode テキスト検証（mb 計数・Null バイト拒否）                 |
| FT346 | —                  | `api-versioning`                     | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT347 | —                  | `upvote-downvote-api`                | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT348 | —                  | `webhook-delivery-api`               | ATK  | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |
| FT349 | —                  | `state-machine-workflow-api`         | 通常 | —                             | ⏭ skip     | 純 app-domain（scope 外）                                        |

---

## Next steps (post-merge of this catalog)

1. Open node Issues only for the **24 `do` rows**, FT-numbered continuing node's
   sequence (FT178+), **not** PHP's numbers — node assigns its own.
2. Priority order: 5 🔧new (framework) → 13 🔒 (security) → 6 📄 (doc catch-up).
3. The 62 skip rows stay documented here as the rationale ledger; revisit only if a
   consumer need surfaces.

Execution rules unchanged: docs-first, one Issue per FT, prettier before
`npm run check`, state snapshot every 3 FTs (`CLAUDE.md`).
