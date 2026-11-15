import test from "node:test";
import assert from "node:assert/strict";
import { canonicalizeLiftingPlotInput } from "../packages/ui/src/lib/lifting-estates.ts";

test("CLIC aliases resolve to the approved canonical reference", () => {
  for (const value of ["1a", " 1 A ", "Plot 1A", "PLOT NO. 1A", "01A", "1-A"]) {
    assert.equal(canonicalizeLiftingPlotInput("clic-estate", value), "1A");
  }
  assert.equal(canonicalizeLiftingPlotInput("clic-estate", "1/B"), "1B");
});

test("invalid CLIC aliases cannot silently resolve", () => {
  for (const value of ["1", "11", "A1", "1C"]) {
    assert.equal(canonicalizeLiftingPlotInput("clic-estate", value), "");
  }
  assert.equal(canonicalizeLiftingPlotInput("clic-estate", "19B"), "19B");
  assert.equal(canonicalizeLiftingPlotInput("another-estate", " A - 1 "), "A - 1");
});
