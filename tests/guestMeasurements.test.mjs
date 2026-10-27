import assert from "node:assert/strict";
import test from "node:test";
import { createGuestSamples, saveGuestMeasurement } from "../lib/guestMeasurements.mjs";
import { localDate, validateMeasurement } from "../lib/measurements.mjs";

test("sample records span eight weeks, are complete, and pass validation across calendar boundaries", () => {
  for (const today of [new Date(2026, 0, 2), new Date(2024, 2, 1), new Date(2026, 9, 27)]) {
    const records = createGuestSamples(today);
    assert.equal(records.length, 8);
    assert.equal(new Set(records.map((entry) => entry._id)).size, 8);
    assert.equal(records.at(-1).date, localDate(today));
    for (const [index, record] of records.entries()) {
      assert.deepEqual(validateMeasurement(record, localDate(today)).errors, {});
      if (index > 0) assert.ok(record.date > records[index - 1].date);
    }
  }
});

test("resetting sample data returns fresh records after guest edits", () => {
  const records = createGuestSamples();
  records[0].weight = 999;
  assert.equal(createGuestSamples()[0].weight, 78);
});

test("guest saves insert and reorder backdated records and replace edits without mutating previous state", () => {
  const previous = [{ _id: "guest-1", date: "2026-10-27", weight: 80 }];
  const added = saveGuestMeasurement(previous, { date: "2026-10-01", weight: 79 }, "guest-2");
  assert.deepEqual(added.map((entry) => entry.weight), [79, 80]);
  const edited = saveGuestMeasurement(added, { date: "2026-10-28", weight: 81 }, "guest-2");
  assert.deepEqual(edited.map((entry) => entry.weight), [80, 81]);
  assert.equal(previous.length, 1);
  assert.equal(added[0].weight, 79);
});
