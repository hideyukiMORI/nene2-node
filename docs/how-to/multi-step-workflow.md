# Multi-Step Workflow

Sequential approval workflow where each step must be approved before advancing. Steps are ordered and tracked; the run carries a status state machine.

## Schema

```sql
CREATE TABLE workflows (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  description TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL
);

CREATE TABLE workflow_steps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  step_order  INTEGER NOT NULL,
  UNIQUE (workflow_id, step_order)
);

CREATE TABLE workflow_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id     INTEGER NOT NULL REFERENCES workflows(id),
  title           TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  current_step_id INTEGER REFERENCES workflow_steps(id),
  created_at      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL
);

CREATE TABLE workflow_actions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id     INTEGER NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  step_id    INTEGER NOT NULL REFERENCES workflow_steps(id),
  action     TEXT    NOT NULL CHECK (action IN ('approve', 'reject')),
  actor      TEXT    NOT NULL,
  comment    TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
```

## Endpoints

| Method | Path                   | Auth  |
| ------ | ---------------------- | ----- |
| `POST` | `/workflows`           | Admin |
| `GET`  | `/workflows/:id`       | Any   |
| `POST` | `/workflows/:id/steps` | Admin |
| `POST` | `/runs`                | Any   |
| `GET`  | `/runs/:id`            | Any   |
| `POST` | `/runs/:id/approve`    | Any   |
| `POST` | `/runs/:id/reject`     | Any   |

## State machine

```
pending   → start()   → in_progress (step 1)
in_progress → approve → in_progress (next step) | completed (last step)
in_progress → reject  → rejected
completed/rejected → 409 on further actions
```

## Step auto-ordering

```ts
async addStep(workflowId: number, name: string): Promise<WorkflowStep> {
  const maxRow = await executor.fetchOne(
    'SELECT COALESCE(MAX(step_order), 0) AS max_order FROM workflow_steps WHERE workflow_id = ?',
    [workflowId],
  );
  const nextOrder = Number(maxRow?.['max_order'] ?? 0) + 1;
  const id = await executor.execute(
    'INSERT INTO workflow_steps (workflow_id, name, step_order) VALUES (?, ?, ?)',
    [workflowId, name, nextOrder],
  );
  return { id, workflowId, name, stepOrder: nextOrder };
}
```

## Approve action

```ts
async approve(runId: number, actor: string, comment: string): Promise<WorkflowRun> {
  const run = await repo.findRunById(runId);
  if (!run) throw new RunNotFoundError(runId);
  if (run.status !== 'in_progress') throw new RunAlreadyFinishedError(); // 409

  // Record the action
  await executor.execute(
    'INSERT INTO workflow_actions (run_id, step_id, action, actor, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [runId, run.currentStepId, 'approve', actor, comment, utcNowIso()],
  );

  // Find next step
  const nextStep = await repo.findNextStep(run.workflowId, run.currentStepId!);

  if (nextStep) {
    // Advance to next step
    await repo.updateRun(runId, { currentStepId: nextStep.id, updatedAt: utcNowIso() });
    return { ...run, currentStepId: nextStep.id };
  } else {
    // Last step — complete
    await repo.updateRun(runId, { status: 'completed', currentStepId: null, updatedAt: utcNowIso() });
    return { ...run, status: 'completed', currentStepId: null };
  }
}
```

## Reject action

```ts
async reject(runId: number, actor: string, comment: string): Promise<void> {
  const run = await repo.findRunById(runId);
  if (!run) throw new RunNotFoundError(runId);
  if (run.status !== 'in_progress') throw new RunAlreadyFinishedError(); // 409

  await executor.execute(
    'INSERT INTO workflow_actions (run_id, step_id, action, actor, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [runId, run.currentStepId, 'reject', actor, comment, utcNowIso()],
  );
  await repo.updateRun(runId, { status: 'rejected', currentStepId: null, updatedAt: utcNowIso() });
}
```

## Framework features used

| Feature           | Import                                   |
| ----------------- | ---------------------------------------- |
| JWT sub           | `authSubFromContext`                     |
| UTC timestamps    | `utcNowIso`                              |
| Atomic multi-step | `runTransaction`                         |
| Validation        | `ValidationException`, `ValidationError` |
