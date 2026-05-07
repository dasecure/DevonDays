# Devon Days Out — PassQR Template Spec

> **Why this document exists:** PassQR's MCP API does not currently expose a `create_template` endpoint, so the production template must be authored in the PassQR dashboard UI (or inserted directly into the `templates` table via the Supabase admin). This document gives you the exact configuration to paste in.

This is the single source of truth for the **Devon Days Out — Resident Explorer** template. When this template exists in your PassQR business, the demo pass `PASS-JMBGA2HH` should be re-issued under it (not under MCP Gym).

---

## 1. Template metadata

| Field | Value |
|---|---|
| **Name** | `Devon Days Out — Resident Explorer` |
| **Type** | `membership` |
| **Description** | The official member pass for Visit South Devon's Devon Days Out scheme. Carries 150+ partner offers, geofenced lock-screen alerts in 6 South Devon towns, and a live deals-redeemed counter. |
| **Brand color** | `#00797f` (Coastal Teal) |
| **Plan requirement** | Starter or Pro (required for Apple/Google Wallet) |
| **Default `max_uses`** | `10` (deals per member; tunable per pass) |

---

## 2. Brand assets

These need to be uploaded into the template's image slots in the dashboard.

| Slot | Spec | Source |
|---|---|---|
| **`logo_url`** | 160×50 px PNG, transparent background | Visit South Devon official logo (request from VSD CIC marketing) |
| **`icon_url`** | 58×58 px PNG, solid background — appears as the pass tile in Wallet | Devon Days Out monogram on `#00797f` square |
| **`strip_url`** | 1125×432 px JPG (3x retina) — the hero image at the top of the pass | Licensed photography: Dartmouth Harbour at golden hour (preferred), Salcombe Estuary, or a Dartmoor tor with morning mist. Rotate seasonally. |

> The on-site mockup at `index.html` uses an inline SVG illustration of Dartmouth Harbour as a stand-in. **Replace with licensed photography before pitching.**

---

## 3. Color & typography

| Token | Hex | Usage |
|---|---|---|
| `--teal` | `#00797f` | Brand primary — pass background tint, key field labels |
| `--teal-deep` | `#004d50` | Headers, secondary labels |
| `--bone` | `#f4ede0` | Pass background (light mode) |
| `--ink` | `#0d2528` | Primary text |
| `--coral` | `#e8825c` | Accent — seasonal spotlight, deals-counter highlight |
| `--gold` | `#f0c070` | Tier badge accent |

Apple Wallet pass JSON keys:
```json
{
  "backgroundColor": "rgb(244, 237, 224)",
  "foregroundColor": "rgb(13, 37, 40)",
  "labelColor": "rgb(0, 77, 80)"
}
```

Typography is Apple-system (SF Pro on iOS, Roboto on Android). Don't try to ship custom fonts in the wallet pass — it will be rejected. The marketing site uses Fraunces; the pass itself uses system fonts.

---

## 4. Field schema

### Front of pass (visible at a glance)

| Key | Type | Default | Required | Notes |
|---|---|---|---|---|
| `tier` | string | `Resident Explorer` | yes | Member tier — supports `Resident Explorer`, `Gold Member`, `Founding Friend` |
| `member_id` | string | — | yes | Format: `DDO-YYYY-NNNNN` (issued sequentially). Maps to PassQR pass `code` for reverse lookup. |
| `home_town` | string | — | no | Member's primary South Devon town |
| `joined` | date (`YYYY-MM-DD`) | auto | yes | Membership start date |
| `deals_redeemed` | integer | `0` | yes | Increments via merchant scan. Pairs with `max_uses` for "X / 10" display. |

### Back of pass (the evolution layer)

| Key | Type | Default | Required | Notes |
|---|---|---|---|---|
| `current_spotlight` | string | `Welcome to Devon Days Out` | yes | Updated centrally — server push refreshes every member's pass |
| `spotlight_ends` | date (`YYYY-MM-DD`) | — | no | Optional end date displayed alongside the spotlight |
| `integration_url` | url | `https://devondaysout.co.uk/my-deals` | yes | Per-member deals dashboard |
| `partner_phone` | phone | — | no | For merchant queries / dispute resolution |
| `partner_email` | email | `support@devondaysout.co.uk` | yes | Member support |
| `validation_url` | url | `https://devondaysout.co.uk/verify/{code}` | yes | Where merchant scan lands |

### Apple-specific keys (auto-injected by PassQR's pass generator)

These don't need to be in the dashboard form — your PassQR backend should inject them when rendering `pass.json`:

```json
{
  "passTypeIdentifier": "pass.com.dasecure.devondaysout.member",
  "teamIdentifier": "<your-apple-team-id>",
  "organizationName": "Visit South Devon CIC",
  "serialNumber": "{pass.code}",
  "webServiceURL": "https://api.passqr.com/v1/wallet",
  "authenticationToken": "{pass.auth_token}",
  "associatedStoreIdentifiers": [],
  "locations": "<see geofences.json>",
  "relevantDate": "{pass.data.spotlight_ends}",
  "barcode": {
    "format": "PKBarcodeFormatQR",
    "message": "{pass.code}",
    "messageEncoding": "iso-8859-1"
  }
}
```

---

## 5. Geofencing

The 8 geofence pins (6 town centres + 2 named partner venues) live in [`geofences.json`](./geofences.json). They are also already wired into the demo pass (`PASS-JMBGA2HH`) via the `data.locations` array.

**Backend integration required:** PassQR's pass-generation service needs to read `pass.data.locations` and emit it as the top-level `locations` key in the generated `pass.json`. If that translation isn't already in place, add it — it's a one-line passthrough in the renderer.

**Quick check for the renderer:**
```ts
// In your pass.json generator
const passJson = {
  ...standardFields,
  locations: pass.data.locations || template.default_locations || [],
  // Apple permits max 10. Truncate if longer.
};
```

---

## 6. Push notification behaviour

This is the section to read carefully because there are subtle differences between what Apple Wallet and Google Wallet support.

### Apple Wallet (PassKit)

| Trigger | Mechanism | Lock-screen text source |
|---|---|---|
| Member arrives in a geofenced area | iOS evaluates `locations` on-device | The matching `relevantText` from the pass |
| `current_spotlight` field changes | PassQR sends silent APNs ping → iOS pulls new pass.json | The field's `changeMessage` template, e.g. `"New spotlight: %@"` |
| Pass becomes invalid | PassQR sets `voided: true`, pushes update | iOS removes the pass automatically |

`changeMessage` per field example:
```json
{
  "key": "current_spotlight",
  "label": "Current spotlight",
  "value": "20% off at Brixham Fish Market",
  "changeMessage": "New spotlight: %@"
}
```

### Google Wallet

Google supports a `messages` array on the pass object. Each message has a `header` and `body` and renders as a banner on Android devices. More flexible than Apple's change-message approach — closer to "real" push but still tied to the pass.

---

## 7. Tier definitions (for the production rollout)

These are defaults Visit South Devon can override:

| Tier | Annual cost | Max deals/year | Push priority | Geofences |
|---|---|---|---|---|
| **Resident Explorer** | Free for South Devon residents (proof required) | 10 | Standard | Full 8-pin set |
| **Gold Member** | £24 | 30 | Priority | Full 8-pin set + early-access pins |
| **Founding Friend** | £75 (capped at first 500 sign-ups) | Unlimited | Priority | Full + exclusive partner venues |

Tier upgrades are achieved by updating `pass.data.tier` and triggering a push refresh — the wallet card visually updates without re-issue.

---

## 8. Authoring the template in the PassQR dashboard

Step-by-step, assuming you're logged in as the dasecure business at <https://app.passqr.com>:

1. Navigate to **Templates** → **New template**
2. Set **Name** to `Devon Days Out — Resident Explorer`, **Type** to `Membership`
3. Set **Brand color** to `#00797f`
4. Upload the three image assets (logo, icon, strip)
5. Add the field schema from §4 (front and back)
6. In **Default values**, set the keys per §4 with the values shown
7. In **Settings** → **Geofencing**, paste the contents of [`geofences.json`](./geofences.json) (or upload the file directly if the dashboard supports it)
8. Set **Default `max_uses`** to `10`
9. Save
10. Note the new template UUID — it will be different from the current MCP Gym backbone (`123031bb-bf42-4b51-8b13-b46b6215a31f`)

Then re-issue Lucy's pass:

```bash
# Pseudo-CLI; use the dashboard or MCP equivalent
passqr passes create \
  --template-id <new-devon-days-out-template-uuid> \
  --holder-name "Lucy Pengelly" \
  --holder-email lucy.pengelly@example.devondaysout.co.uk \
  --max-uses 10 \
  --data @lucy-pengelly-data.json
```

Update the four occurrences of `PASS-JMBGA2HH` in `index.html` with the new code.

---

## 9. Alternative path — direct Supabase insert

If you'd prefer to skip the dashboard UI, the template can be inserted directly into the `templates` table via the Supabase MCP. The schema is observable from `list_templates` output. **Get explicit approval before doing this** — it's a destructive write to production data.

If you want me to do this on your next message, just say "insert via Supabase" and I'll prepare the SQL (or the `Supabase:execute_sql` call) and show it for approval before running.

---

## 10. Production checklist

- [ ] Template authored (this document)
- [x] Geofence coordinates wired into the demo pass
- [x] Geofence config exported as `geofences.json`
- [ ] Brand assets (logo PNG, icon PNG, strip JPG) provided by Visit South Devon CIC
- [ ] PassQR backend renderer confirmed to passthrough `pass.data.locations` → `pass.json.locations`
- [ ] APNs push notification cert configured for the Devon Days Out pass type identifier
- [ ] Google Wallet issuer account verified
- [ ] Custom domain `devondaysout.co.uk` pointed at GitHub Pages / Cloudflare Pages

---

> Built by [dasecure.com](https://dasecure.com). Demo only. Not affiliated with Visit South Devon CIC.
