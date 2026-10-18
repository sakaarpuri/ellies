# Orders and notifications

Arohini is INR 250 per 200 ml bottle, with free delivery within India. Quantity is limited to 1-6 per checkout. Product prices are calculated on the server. Consultation remains INR 200.

## Records

Netlify Blobs stores private order details before payment and an immutable paid marker after verification. Store: `commerce-production`. Events and a retry outbox are independent of Google Sheets. Local development uses git-ignored `.local-commerce/` and never writes to the live store.

The existing Google Sheet receives records in a new tab, **Website orders and bookings**. Existing tabs remain untouched. Share the sheet only with authorised administrators; never publish it. The data includes contact details, health concerns and delivery addresses.

Customer and administrator emails are sent after verified payment. A consultation enquiry has a separate acknowledgement, not a paid-booking receipt. Admin alerts go to `support@elliesbotanics.com`; replies from customers go there too. Failed emails remain in the outbox. Dispatch and consultation scheduling still require the team to contact the customer.

## Required Google setup

1. Replace the existing Apps Script code with `docs/google-apps-script-leads.gs`, preserving the same secret as Netlify's `LEADS_WEBHOOK_SECRET`. Alternatively set the script property `LEADS_WEBHOOK_SECRET`. Never commit the real secret.
2. Run `authorizeAndTest` as the spreadsheet owner and approve Sheets and email access. This sends a clearly labelled setup email to the administrator, not a customer.
3. In **Deploy > Manage deployments**, edit the existing Web App deployment, select **New version**, and deploy. Execute as the owner. Preserve the existing `/exec` URL and access configuration; requests must pass the shared secret.
4. Confirm the admin setup email arrives. Perform a labelled test enquiry and check the new tab plus customer/admin status columns. Do not make a live charge just for testing without approval.

The previously deployed script returned an HTML error with HTTP 200 because MailApp was not authorised. The website now requires explicit JSON `ok: true` and individual email status values, rather than treating any HTTP 200 as delivery.

## Payment recovery

Return URLs remain `/api/payu/success` and `/api/payu/failure`. Both verify the hash, merchant key, saved transaction, expected amount, product and customer email. Only a successful status can generate paid notifications. Receipts use signed references, not caller-supplied verification flags.

The Netlify scheduled function `commerce-recovery` runs every ten minutes. It calls a secret-protected endpoint to reconcile pending payments with PayU and retry notifications in bounded batches. Pending payments are checked for seven days. A round-robin cursor prevents one failing record from monopolising retries. Failed notification records remain saved until delivery or administrator intervention.

Recommended additional resilience: enable PayU payment webhooks pointing to `https://www.elliesbotanics.com/api/payu/webhook` in the merchant dashboard. No dashboard webhook is assumed configured by this code change. Reconciliation also covers a browser closing before returning from checkout.

For orders created before this storage system, check the existing sheet and PayU merchant dashboard directly. Never infer payment success from a customer-provided screenshot or receipt URL alone.

## Checks

Run `npm test`, `npm run lint`, and `npm run build`. Tests cover amount tampering, failed/forged callbacks, consent/address validation, receipt tokens, notification retries and Apps Script record-first/idempotent behaviour. Browser checkout tests must intercept the gateway submission so they do not create a live charge.

The product page uses the supplied product image and conservative descriptions from the supplied document. Dosage, delivery timelines and product-specific return guarantees were not invented. Confirm final labelling and commercial policies before a broader sales campaign.
