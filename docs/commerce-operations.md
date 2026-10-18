# Orders and notifications

Arohini is INR 270 per 200 ml bottle, with free delivery within India. Quantity is limited to 1-6 per checkout. Product prices are calculated on the server. Consultation remains INR 200. Existing orders retain the price saved when checkout was initiated.

## Records

Netlify Blobs stores private order details before payment and an immutable paid marker after verification. Store: `commerce-production`. Events and a retry outbox are independent of Google Sheets. Local development uses git-ignored `.local-commerce/` and never writes to the live store.

The existing Google Sheet receives records in a new tab, **Website orders and bookings**. Existing tabs remain untouched. Share the sheet only with authorised administrators; never publish it. The data includes contact details, health concerns and delivery addresses.

Customer and administrator emails are sent after verified payment using Titan SMTP, independently of Sheets. A consultation enquiry has a separate acknowledgement, not a paid-booking receipt. The sender, envelope sender, reply-to and admin destination are `support@elliesbotanics.com`. No personal Google account sends email. Failed emails remain in the outbox. Dispatch and consultation scheduling still require the team to contact the customer.

## Titan email setup

Store the support mailbox password as server-only `SMTP_PASSWORD` in Netlify (production/functions scope), then redeploy. GoDaddy-powered Titan uses `smtpout.secureserver.net`, SSL port 465, and username `support@elliesbotanics.com`. Do not use the GoDaddy account password or commit credentials. Missing/invalid credentials fail closed; there is no Gmail fallback. Test with explicitly labelled synthetic content and an administrator-owned inbox, never a real payment.

Delivery checkpoints track each recipient independently. `sent` means the SMTP server accepted that recipient, not proof of inbox arrival. The delivery lease prevents concurrent workers; checkpoints prevent ordinary retries resending successful recipients. SMTP is at-least-once: a crash between acceptance and saving the checkpoint can still cause a duplicate. Stable Message-IDs help clients recognise retries. Admin alerts include contact/order details (not private health concerns) so the team can respond even while Sheets is unavailable.

## Required Google setup

1. Replace the existing Apps Script code with `docs/google-apps-script-leads.gs`, preserving the same secret as Netlify's `LEADS_WEBHOOK_SECRET`. Alternatively set the script property `LEADS_WEBHOOK_SECRET`. Never commit the real secret.
2. Run `authorizeRecords` as the spreadsheet owner and approve Sheets access only. There is no email permission and no email test in this script. Remove any old MailApp/GmailApp code and explicit mail scopes from the script project.
3. In **Deploy > Manage deployments**, edit the existing Web App deployment, select **New version**, and deploy. Execute as the owner. Preserve the existing `/exec` URL and access configuration; requests must pass the shared secret.
4. Confirm the deployment URL returns `{"service":"ellies-records-only-v1"}` on GET. Perform a labelled test enquiry and check the new tab. Email delivery is tracked by the website, not this sheet. Do not make a live charge just for testing without approval.

The previously deployed script returned an HTML error with HTTP 200 because MailApp was not authorised. The website now checks the records-only protocol before sending any POST, preventing the old script from sending as the owner's personal account. It requires explicit JSON `ok: true` for sheet storage. Sheet failures remain queued but do not block email. Publish the records-only script to resume sheet syncing.

## Payment recovery

Return URLs remain `/api/payu/success` and `/api/payu/failure`. Both verify the hash, merchant key, saved transaction, expected amount, product and customer email. Only a successful status can generate paid notifications. Receipts use signed references, not caller-supplied verification flags.

The Netlify scheduled function `commerce-recovery` runs every ten minutes. It calls a secret-protected endpoint to reconcile pending payments with PayU and retry notifications in bounded batches. Pending payments are checked for seven days. A round-robin cursor prevents one failing record from monopolising retries. Failed notification records remain saved until delivery or administrator intervention.

Recommended additional resilience: enable PayU payment webhooks pointing to `https://www.elliesbotanics.com/api/payu/webhook` in the merchant dashboard. No dashboard webhook is assumed configured by this code change. Reconciliation also covers a browser closing before returning from checkout.

For orders created before this storage system, check the existing sheet and PayU merchant dashboard directly. Never infer payment success from a customer-provided screenshot or receipt URL alone.

## Checks

Run `npm test`, `npm run lint`, and `npm run build`. Tests cover amount tampering, failed/forged callbacks, consent/address validation, receipt tokens, notification retries and Apps Script record-first/idempotent behaviour. Browser checkout tests must intercept the gateway submission so they do not create a live charge.

The product page uses the supplied product image and conservative descriptions from the supplied document. Dosage, delivery timelines and product-specific return guarantees were not invented. Confirm final labelling and commercial policies before a broader sales campaign.
