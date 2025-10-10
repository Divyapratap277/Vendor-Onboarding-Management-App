
> backend@1.0.0 test
> mocha --timeout 10000 --exit tests/*.js

[dotenv@17.2.1] injecting env (6) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.1] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: vendor
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin, vendor
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: vendor
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin
AuthMiddleware: authorizeRoles called. Required roles: admin


--- Starting Backend API Tests Setup ---
Connected to test database: mongodb://localhost:27017/vms_test_db
Cleaned test database.
Login request received: { email: 'testadmin@example.com' }
User found: {
  _id: new ObjectId('6894e589989b44f09608a449'),
  name: 'Test Admin',
  email: 'testadmin@example.com',
  password: '$2b$10$hUzZvl6xslDxrGFmbADeSu1EQmFmpqgMtULvCoCuexlmBjI.frEL2',
  role: 'admin',
  vendorDetails: null,
  createdAt: 2025-08-07T17:42:33.496Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e589989b44f09608a449') Role: admin
Login request received: { email: 'testvendor@example.com' }
User found: {
  _id: new ObjectId('6894e589989b44f09608a44c'),
  name: 'Test Vendor User',
  email: 'testvendor@example.com',
  password: '$2b$10$U2YZ.BwJuHjMW2KO780.guCyEOWcdngtC5CrOFaskwLgb1E00qyAO',
  role: 'vendor',
  vendorDetails: new ObjectId('6894e589989b44f09608a44e'),
  createdAt: 2025-08-07T17:42:33.730Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e589989b44f09608a44c') Role: vendor

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

Login request received: { email: 'onboardingtest@example.com' }
User found: {
  _id: new ObjectId('6894e58a989b44f09608a460'),
  name: 'John Doe',
  email: 'onboardingtest@example.com',
  password: '$2b$10$Fev83DnzJ9ClrutPnvtjF.rxBD3MBeeJvlA5DYYQmbfhrqUFTHJzy',
  role: 'vendor',
  vendorDetails: null,
  createdAt: 2025-08-07T17:42:34.721Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e58a989b44f09608a460') Role: vendor

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---


--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

Attempting to launch Puppeteer browser for Bill PDF...
Puppeteer browser launched successfully for Bill PDF.
generateBillPDF: Setting HTML content for page...
generateBillPDF: Waiting for 500ms before generating PDF...
generateBillPDF: HTML content set. Attempting to generate PDF...
generateBillPDF: PDF buffer generated.
generateBillPDF: PDF saved to: C:\Users\divya\Desktop\VMS_project_backup\backend\uploads\bills\bill_BILL_1754588555170_681_1754588564201.pdf
generateBillPDF: PDF saved with filename: bill_BILL_1754588555170_681_1754588564201.pdf
generateBillPDF: Closing Puppeteer browser.
Successfully generated and saved PDF for Bill BILL-1754588555170-681. Path: bills/bill_BILL_1754588555170_681_1754588564201.pdf
--- Backend API Tests Setup Complete ---
  Authentication API
    ✔ should allow a new user to register with valid credentials (318ms)
    ✔ should not allow registration with an existing email (272ms)
Login request received: { email: 'testadmin@example.com' }
User found: {
  _id: new ObjectId('6894e589989b44f09608a449'),
  name: 'Test Admin',
  email: 'testadmin@example.com',
  password: '$2b$10$hUzZvl6xslDxrGFmbADeSu1EQmFmpqgMtULvCoCuexlmBjI.frEL2',
  role: 'admin',
  vendorDetails: null,
  createdAt: 2025-08-07T17:42:33.496Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e589989b44f09608a449') Role: admin
    ✔ should allow admin to login with valid credentials (203ms)
Login request received: { email: 'testvendor@example.com' }
User found: {
  _id: new ObjectId('6894e589989b44f09608a44c'),
  name: 'Test Vendor User',
  email: 'testvendor@example.com',
  password: '$2b$10$U2YZ.BwJuHjMW2KO780.guCyEOWcdngtC5CrOFaskwLgb1E00qyAO',
  role: 'vendor',
  vendorDetails: new ObjectId('6894e589989b44f09608a44e'),
  createdAt: 2025-08-07T17:42:33.730Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e589989b44f09608a44c') Role: vendor
    ✔ should allow vendor to login with valid credentials (164ms)
Login request received: { email: 'wrong@example.com' }
User found: null
Password match failed for user: wrong@example.com
    ✔ should reject login with invalid credentials

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should get user profile for authenticated admin

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should get user profile for authenticated vendor user

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow authenticated user to logout

  Admin Vendor Onboarding API

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to create an onboarding token for a new vendor

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

getOnboardingSubmissions: Returning 4 submissions
    ✔ should allow admin to get all pending onboarding submissions

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

approveOnboardingSubmission: User 6894e597989b44f09608a492 role updated to 'vendor' and linked to Vendor 6894e597989b44f09608a494
    ✔ should allow admin to approve a new pending vendor submission and link user (198ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to reject a pending vendor submission with a reason

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should prevent approval of an already approved submission

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should prevent rejection of a non-pending submission

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get a single vendor onboarding submission by ID

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to generate a presigned URL for document download

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get all vendors

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get all approved vendors

  Purchase Order API (Admin Actions)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to create a new purchase order for an approved vendor

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should not allow admin to create a new purchase order with invalid delivery date

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get all purchase orders

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to create a purchase order with a very large quantity

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get a specific purchase order by ID

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

PO saved with PDF path: purchase_orders/PO-PO-1754588567491-382.pdf, filename: PO-PO-1754588567491-382.pdf
Saved PO object: {
  _id: new ObjectId('6894e597989b44f09608a4af'),
  orderNumber: 'PO-1754588567491-382',
  vendor: {
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    _id: new ObjectId('6894e589989b44f09608a44e'),
    user: new ObjectId('6894e589989b44f09608a44c'),
    businessName: 'Test Vendor Corp',
    contactPerson: 'Jane Test',
    contactEmail: 'testvendor@example.com',
    contactPhone: '111-222-3333',
    servicesOffered: [],
    status: 'approved',
    registrationDate: 2025-08-07T17:42:33.912Z,
    documents: [],
    createdAt: 2025-08-07T17:42:33.916Z,
    updatedAt: 2025-08-07T17:42:33.916Z,
    __v: 0
  },
  items: [
    {
      description: 'Laptop',
      quantity: 2,
      unitPrice: 500,
      _id: new ObjectId('6894e597989b44f09608a4b0')
    },
    {
      description: 'Monitor',
      quantity: 1,
      unitPrice: 250,
      _id: new ObjectId('6894e597989b44f09608a4b1')
    }
  ],
  totalAmount: 1250,
  issueDate: 2025-08-07T17:42:47.491Z,
  deliveryDate: 2025-08-30T00:00:00.000Z,
  status: 'pending',
  billId: null,
  createdAt: 2025-08-07T17:42:47.496Z,
  updatedAt: 2025-08-07T17:42:53.392Z,
  __v: 0,
  pdfPath: 'purchase_orders/PO-PO-1754588567491-382.pdf',
  pdfFileName: 'PO-PO-1754588567491-382.pdf'
}
    ✔ should allow admin to generate PDF for a purchase order (5824ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to update a purchase order (63ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to delete a purchase order (49ms)

  Vendor Purchase Order Access

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

PO saved with PDF path: purchase_orders/PO-PO-VENDOR-FETCH.pdf, filename: PO-PO-VENDOR-FETCH.pdf
Saved PO object: {
  _id: new ObjectId('6894e59d989b44f09608a4e0'),
  orderNumber: 'PO-VENDOR-FETCH',
  vendor: {
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    _id: new ObjectId('6894e589989b44f09608a44e'),
    user: new ObjectId('6894e589989b44f09608a44c'),
    businessName: 'Test Vendor Corp',
    contactPerson: 'Jane Test',
    contactEmail: 'testvendor@example.com',
    contactPhone: '111-222-3333',
    servicesOffered: [],
    status: 'approved',
    registrationDate: 2025-08-07T17:42:33.912Z,
    documents: [],
    createdAt: 2025-08-07T17:42:33.916Z,
    updatedAt: 2025-08-07T17:42:33.916Z,
    __v: 0
  },
  items: [
    {
      description: 'Vendor Fetched Item',
      quantity: 1,
      unitPrice: 50,
      _id: new ObjectId('6894e59d989b44f09608a4e1')
    }
  ],
  totalAmount: 50,
  issueDate: 2025-08-07T17:42:53.528Z,
  deliveryDate: 2025-09-10T00:00:00.000Z,
  status: 'pending',
  billId: null,
  createdAt: 2025-08-07T17:42:53.532Z,
  updatedAt: 2025-08-07T17:42:58.007Z,
  __v: 0,
  pdfPath: 'purchase_orders/PO-PO-VENDOR-FETCH.pdf',
  pdfFileName: 'PO-PO-VENDOR-FETCH.pdf'
}

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a44c, Role: vendor
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
Backend: getVendorPurchaseOrders called.
Backend: req.user from protect middleware: {
  _id: new ObjectId('6894e589989b44f09608a44c'),
  name: 'Test Vendor User',
  email: 'testvendor@example.com',
  role: 'vendor',
  vendorDetails: {
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    _id: new ObjectId('6894e589989b44f09608a44e'),
    user: new ObjectId('6894e589989b44f09608a44c'),
    businessName: 'Test Vendor Corp',
    contactPerson: 'Jane Test',
    contactEmail: 'testvendor@example.com',
    contactPhone: '111-222-3333',
    servicesOffered: [],
    status: 'approved',
    registrationDate: 2025-08-07T17:42:33.912Z,
    documents: [],
    createdAt: 2025-08-07T17:42:33.916Z,
    updatedAt: 2025-08-07T17:42:33.916Z,
    __v: 0
  },
  createdAt: 2025-08-07T17:42:33.730Z,
  __v: 0
}
--- AuthMiddleware: protect function finished ---

Backend: vendorUser fetched in getVendorPurchaseOrders: {
  _id: new ObjectId('6894e589989b44f09608a44c'),
  vendorDetails: new ObjectId('6894e589989b44f09608a44e')
}
Backend: getVendorPurchaseOrders: Using vendorId: new ObjectId('6894e589989b44f09608a44e')
Backend: getVendorPurchaseOrders: Found 4 POs and 1 Bills.
    ✔ should allow vendor to get their own purchase orders (4572ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a44c, Role: vendor
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should not allow vendor to get another admin/vendor purchase order by ID (49ms)

  Bill API

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

Attempting to launch Puppeteer browser for Bill PDF...
Puppeteer browser launched successfully for Bill PDF.
generateBillPDF: Setting HTML content for page...
generateBillPDF: Waiting for 500ms before generating PDF...
generateBillPDF: HTML content set. Attempting to generate PDF...
generateBillPDF: PDF buffer generated.
generateBillPDF: PDF saved to: C:\Users\divya\Desktop\VMS_project_backup\backend\uploads\bills\bill_BILL_1754588578185_803_1754588583896.pdf
generateBillPDF: PDF saved with filename: bill_BILL_1754588578185_803_1754588583896.pdf
generateBillPDF: Closing Puppeteer browser.
Successfully generated and saved PDF for Bill BILL-1754588578185-803. Path: bills/bill_BILL_1754588578185_803_1754588583896.pdf
    ✔ should allow admin to create a new bill (6995ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get all bills

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get a specific bill by ID

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

updateBill: called with id: 6894e5a2989b44f09608a500
updateBill: about to generate PDF for bill: BILL-1754588578185-803
Attempting to launch Puppeteer browser for Bill PDF...
Puppeteer browser launched successfully for Bill PDF.
generateBillPDF: Setting HTML content for page...
generateBillPDF: Waiting for 500ms before generating PDF...
generateBillPDF: HTML content set. Attempting to generate PDF...
generateBillPDF: PDF buffer generated.
generateBillPDF: PDF saved to: C:\Users\divya\Desktop\VMS_project_backup\backend\uploads\bills\bill_BILL_1754588578185_803_1754588589509.pdf
generateBillPDF: PDF saved with filename: bill_BILL_1754588578185_803_1754588589509.pdf
generateBillPDF: Closing Puppeteer browser.
Successfully regenerated and saved PDF for Bill BILL-1754588578185-803. Path: bills/bill_BILL_1754588578185_803_1754588589509.pdf
    ✔ should allow admin to update a bill (4969ms)
Notification object: {
  recipient: new ObjectId('6894e589989b44f09608a44c'),
  message: 'Bill BILL-1754588578185-803 has been updated by the admin. Payment Status: unpaid.',
  type: 'BILL_ADMIN_UPDATED',
  relatedId: new ObjectId('6894e5a2989b44f09608a500'),
  relatedModel: 'Bill'
}
New notification: {
  recipient: new ObjectId('6894e589989b44f09608a44c'),
  message: 'Bill BILL-1754588578185-803 has been updated by the admin. Payment Status: unpaid.',
  type: 'BILL_ADMIN_UPDATED',
  relatedId: new ObjectId('6894e5a2989b44f09608a500'),
  relatedModel: 'Bill',
  isRead: false,
  _id: new ObjectId('6894e5ae989b44f09608a51e')
}
Notification sent to vendor testvendor@example.com for updated bill BILL-1754588578185-803

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

generateBillPdfForExistingBill: called with id: 6894e5a2989b44f09608a500
Attempting to launch Puppeteer browser for Bill PDF...
Puppeteer browser launched successfully for Bill PDF.
generateBillPDF: Setting HTML content for page...
generateBillPDF: Waiting for 500ms before generating PDF...
generateBillPDF: HTML content set. Attempting to generate PDF...
generateBillPDF: PDF buffer generated.
generateBillPDF: PDF saved to: C:\Users\divya\Desktop\VMS_project_backup\backend\uploads\bills\bill_BILL_1754588578185_803_1754588594241.pdf
generateBillPDF: PDF saved with filename: bill_BILL_1754588578185_803_1754588594241.pdf
generateBillPDF: Closing Puppeteer browser.
    ✔ should allow admin to generate PDF for an existing bill (4479ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to download a bill PDF

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a44c, Role: vendor
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow vendor to get their own bills (38ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow vendor to download their own bill PDF

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

Deleted PDF file: C:\Users\divya\Desktop\VMS_project_backup\backend\uploads\bills\bill_BILL_1754588578185_803_1754588594241.pdf
    ✔ should allow admin to delete a bill

  Notification API

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow authenticated user to get their notifications

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow authenticated user to mark a notification as read

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should prevent unauthorized user from marking a notification as read

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow authenticated user to delete a notification

  Onboarding API (Vendor Actions)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a public user to verify an onboarding token

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a public user to complete vendor onboarding (306ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a public user to generate a presigned URL for document upload

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a public user to confirm document upload (78ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a public user to upload a document and confirm the upload (83ms)

  Vendor API (Vendor Actions)
Login request received: { email: 'newregister@example.com' }
User found: {
  _id: new ObjectId('6894e5b3989b44f09608a57e'),
  name: 'New User to Register',
  email: 'newregister@example.com',
  password: '$2b$10$MRc5T7L1nvt0jHHz0uz1IuFXK/kRySfr8ZoRpF6Ye2trT/1J3Ll9K',
  role: 'vendor',
  vendorDetails: null,
  createdAt: 2025-08-07T17:43:15.443Z,
  __v: 0
}
Login successful. User ID: new ObjectId('6894e5b3989b44f09608a57e') Role: vendor

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e5b3989b44f09608a57e',
  role: 'vendor',
  iat: 1754588595,
  exp: 1754592195
}
AuthMiddleware: Looking for User with ID: 6894e5b3989b44f09608a57e and role: vendor
AuthMiddleware: User found (or null): ID: 6894e5b3989b44f09608a57e, Email: newregister@example.com, Role: vendor, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

registerVendor: User ID from request: 6894e5b3989b44f09608a57e
registerVendor: Vendor created successfully: {
  user: new ObjectId('6894e5b3989b44f09608a57e'),
  businessName: 'New Test Business',
  contactPerson: 'Test Contact',
  contactEmail: 'newregister@example.example.com',
  contactPhone: '123-456-7890',
  address: {
    street: '123 Vendor St',
    city: 'Vendor City',
    state: 'VS',
    zipCode: '98765',
    country: 'USA'
  },
  servicesOffered: [ 'Consulting', 'Development' ],
  status: 'pending',
  bankDetails: {
    accountHolderName: 'Test Contact',
    accountNumber: '1122334455',
    ifscCode: 'TESTBANK001',
    bankName: 'Test Bank',
    branch: 'Test Branch'
  },
  _id: new ObjectId('6894e5b4989b44f09608a585'),
  registrationDate: 2025-08-07T17:43:16.034Z,
  documents: [],
  createdAt: 2025-08-07T17:43:16.037Z,
  updatedAt: 2025-08-07T17:43:16.037Z,
  __v: 0
}
    ✔ should allow a logged-in user to register as a vendor (611ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

Vendor 6894e589989b44f09608a44e has incomplete or missing address data.
    ✔ should allow a vendor to get their own profile (42ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a44c',
  role: 'vendor',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a44c and role: vendor
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a44c, Email: testvendor@example.com, Role: vendor, VendorDetails: {
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  _id: new ObjectId('6894e589989b44f09608a44e'),
  user: new ObjectId('6894e589989b44f09608a44c'),
  businessName: 'Test Vendor Corp',
  contactPerson: 'Jane Test',
  contactEmail: 'testvendor@example.com',
  contactPhone: '111-222-3333',
  servicesOffered: [],
  status: 'approved',
  registrationDate: 2025-08-07T17:42:33.912Z,
  documents: [],
  createdAt: 2025-08-07T17:42:33.916Z,
  updatedAt: 2025-08-07T17:42:33.916Z,
  __v: 0
}
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow a vendor to update their own profile (44ms)
    ✔ should allow an approved vendor to login via vendor-specific login (244ms)
Caught in Global Error Handler: Error: Vendor account is not yet approved.
    at C:\Users\divya\Desktop\VMS_project_backup\backend\src\controllers\vendorController.js:194:23
    ✔ should reject a pending vendor login via vendor-specific login (505ms)

  Purchase Order API (Extended Coverage)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to cancel a purchase order (41ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get cancelled purchase orders

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to restore a cancelled purchase order (45ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to permanently delete a purchase order

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
AuthMiddleware: authorizeRoles: Checking user role...
AuthMiddleware: authorizeRoles: req.user: ID: 6894e589989b44f09608a449, Role: admin
AuthMiddleware: authorizeRoles completed successfully. User role is allowed. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to update purchase order status

  Vendor API (Admin Management)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get all vendors

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to get a vendor by ID

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to update a vendor by ID (277ms)

--- AuthMiddleware: protect function started ---
AuthMiddleware: Token found in Authorization header.
AuthMiddleware: Attempting to verify token...
AuthMiddleware: Decoded JWT Payload: {
  id: '6894e589989b44f09608a449',
  role: 'admin',
  iat: 1754588554,
  exp: 1754592154
}
AuthMiddleware: Looking for User with ID: 6894e589989b44f09608a449 and role: admin
AuthMiddleware: User found (or null): ID: 6894e589989b44f09608a449, Email: testadmin@example.com, Role: admin, VendorDetails: null
AuthMiddleware: protect middleware completed successfully. Calling next().
--- AuthMiddleware: protect function finished ---

    ✔ should allow admin to delete a vendor by ID (247ms)

--- Starting Backend API Tests Teardown ---
--- Backend API Tests Teardown Complete ---

  60 passing (44s)

