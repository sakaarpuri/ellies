const leadFields = [
  "eventType",
  "createdAt",
  "name",
  "phone",
  "email",
  "concernArea",
  "concern",
  "consent",
  "txnid",
  "amount",
  "productinfo",
  "paymentStatus",
  "verified",
  "source",
];

export function NetlifyLeadForms() {
  return (
    <div hidden aria-hidden="true">
      {["consultation_lead", "consultation_payment"].map((formName) => (
        <form key={formName} name={formName} method="POST" data-netlify="true">
          <input type="hidden" name="form-name" value={formName} />
          {leadFields.map((field) => (
            <input key={field} type="hidden" name={field} />
          ))}
        </form>
      ))}
    </div>
  );
}
