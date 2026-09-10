import assert from "node:assert/strict"
import test from "node:test"
import { parseRouteRequestInput } from "../src/lib/validation/route-request"

test("route request validation normalizes a valid public form payload", () => {
  const parsed = parseRouteRequestInput({
    citizenship: "kr",
    destination: "au",
    goal: "study-to-work",
    field: "  Nursing  ",
    locale: "en",
    requestKind: "guide_interest",
    email: "Candidate@Example.com ",
    notificationConsent: true,
  })

  assert.deepEqual(parsed, {
    honeypot: false,
    input: {
      citizenshipCode: "KR",
      destinationCode: "AU",
      goal: "study-to-work",
      field: "nursing",
      locale: "en",
      requestKind: "guide_interest",
      notificationEmail: "candidate@example.com",
      notificationConsent: true,
    },
  })
})

test("route request validation rejects malformed and unconsented notification payloads", () => {
  assert.equal(parseRouteRequestInput(["not", "an", "object"]).input, null)
  assert.equal(parseRouteRequestInput({
    citizenship: "KR",
    destination: "AU",
    goal: "study",
    field: "nursing",
    requestKind: "guide_interest",
    notificationConsent: false,
  }).input, null)
  assert.equal(parseRouteRequestInput({
    citizenship: "XX",
    destination: "AU",
    goal: "study",
    field: "nursing",
  }).input, null)
})

test("route request validation detects the honeypot without admitting its payload", () => {
  const parsed = parseRouteRequestInput({
    citizenship: "KR",
    destination: "AU",
    goal: "study",
    field: "nursing",
    company: "automated sender",
  })

  assert.equal(parsed.honeypot, true)
  assert.equal(parsed.input?.notificationEmail, null)
})
