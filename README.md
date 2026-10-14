"# VisitorManagementSys"



=========== STAGE 2 MODIFICATIONS (For sri lankan factories system remain as current flow no changes needed but for other countries these below modifications required) ===========

 

1\. Remove the Department User role from the system.

&#x20;   - we can leave those department login as how they are currently. what we have to remove is, department user approval level means

&#x20;     when visitor registered, the request should directly send to the hr user not department user. if hr approval granted system should

&#x20;     send some emails to particular department **department head** \& **department users** \& **hr manager** and display it on dashboard.



2\. Add "Purpose for Visit" to the visitor registration form:

&#x20;   - Capture the visit purpose during registration.

&#x20;   - Support predefined options.

&#x20;   - Include an "Other" option with a free-text field.



3\. Fix Visitor Entry/Exit Reports:

&#x20;   - Reports generated for a date range must include all dates within the selected period.

&#x20;   - No visitor records should be omitted.





"

ALTER TABLE Factories

&#x20; ADD COLUMN Country VARCHAR(255) NULL,

&#x20; ADD COLUMN Workflow\_Type VARCHAR(255) NOT NULL DEFAULT 'STANDARD';



ALTER TABLE Visits

&#x20; ADD COLUMN Purpose\_Other VARCHAR(255) NULL;

"

