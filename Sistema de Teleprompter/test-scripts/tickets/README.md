Tickets export for Bugzilla / TestLink

Files created:
- `bugzilla_incidents.csv` : CSV rows ready to import into Bugzilla (fields: product,component,summary,description,version,severity,priority,op_sys,platform,reporter,cc)
- `testlink_cases.csv` : CSV with test cases that can be imported into TestLink or used to create test cases manually.

How to import into Bugzilla:
1. Login to Bugzilla as a user with permission to file bugs.
2. Go to 'File a Bug' -> choose product and component. Bugzilla typically supports CSV import via admin tools or custom scripts. If your Bugzilla instance has an "import" extension, follow its CSV field mapping.
3. If no CSV import: open each row in `bugzilla_incidents.csv` and create a new bug using the summary/description fields. Attach evidence (logs/screenshots) from `test-scripts/results/` or `test-scripts/reports/`.

How to import into TestLink:
1. TestLink supports different import formats. The simplest option is to use the TestLink GUI to create Test Suites and then import test cases via CSV or XML depending on your TestLink version.
2. If TestLink CSV import is available, map fields: test_case_name -> name, summary -> summary, steps -> steps, expected_result -> expected_results, execution_type -> execution_type, priority -> importance.
3. Otherwise, create test cases manually using the rows in `testlink_cases.csv`.

Next steps I can do for you:
- Generate TestLink XML (if you provide target Test Project name).
- Attempt to auto-create bugs in Bugzilla via API (you must provide API URL and credentials or an API key).
- Create a small script to POST these CSV rows to Bugzilla/TestLink API (requires credentials).

Files are in `test-scripts/tickets/`.
