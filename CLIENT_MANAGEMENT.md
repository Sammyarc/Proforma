# Client management

Implemented locally with the existing workspace design.

- Create and edit client name, billing email, company, phone, billing address and private notes.
- Search name/email/company with paginated active and archived views. Archive and restore without deleting billing history.
- Emails are normalized to lowercase and unique within an account, including archived records. Version checks reject stale edits. Ownership comes from the authenticated session.
- Create an invoice from a client card to prefill name, email and billing address. Client notes and phone numbers are not copied into invoices. Draft saves and initial delivery preparation reject clients belonging to another account or archived clients.
- Linked invoices keep a stable client ID and their original billing details when the client is edited. Client edits do not overwrite already saved drafts.
- Invoice history is paginated. Legacy invoices without a client ID are matched by the client's current billing email, within the same account. Changing that email changes which legacy invoices match; newer linked invoices remain associated.

Existing invoice-derived contacts are not automatically migrated. Add a saved client using the same billing email to see its older invoice history. No production data was changed.

Deploy frontend and backend together. Startup creates the clients collection's unique owner/email index. The existing database, authentication and invoice-delivery deployment requirements still apply.

Validation: 17 backend regression tests pass, including mocked account isolation, duplicate-email handling, version conflicts, archive/restore, history and foreign/archived client rejection on draft saves. Browser fixtures cover create/edit/history/archive/restore, invoice prefill and 390px/1440px layouts. Frontend production build passes; it reports the existing outdated Browserslist data plus a main-bundle size advisory. Live database/index and end-to-end delivery validation remain release checks.
