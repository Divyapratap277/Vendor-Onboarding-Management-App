# Vendor Onboarding & Management System

This is a web-based platform designed to streamline the entire vendor lifecycle, from initial onboarding to purchase order (PO) and invoice management. It provides a secure, efficient, and user-friendly experience for both internal administrators and external vendors.

## Features

### Admin Panel
- **Secure Vendor Onboarding:** Generate secure, single-use links for new vendors to onboard.
- **Onboarding Management:** Dashboard to track and manage vendor onboarding requests (pending, approved, rejected).
- **Vendor Database:** A centralized view of all approved vendors.
- **Purchase Order Management:** Create, assign, and manage purchase orders.
- **Bill Management:** Generate and manage bills for vendors.
- **Custom Form Builder:** Create and manage multi-step onboarding forms with custom fields and validation.

### Vendor Portal
- **Simple Onboarding:** A guided, multi-step form for vendors to submit their information and documents.
- **Digital Signature:** Vendors can digitally sign the onboarding form.
- **Dashboard:** An overview of new POs, pending actions, and bill statuses.
- **PO Management:** View, download, and manage purchase orders.
- **Bill Tracking:** Track the status of all bills and payments.

## Tech Stack

### Frontend
- **Framework:** Next.js with React 18
- **Styling:** Tailwind CSS with Shadcn/UI
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Data Fetching:** SWR

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **PDF Generation:** Puppeteer
- **PDF Manipulation:** pdf-lib
- **Document Storage:** S3-Compatible Object Storage

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm
- MongoDB
- An S3-compatible object storage service

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory and add the following environment variables:
     ```
     PORT=5000
     MONGO_URI=<your-mongodb-uri>
     JWT_SECRET=<your-jwt-secret>
     S3_ACCESS_KEY_ID=<your-s3-access-key>
     S3_SECRET_ACCESS_KEY=<your-s3-secret-key>
     S3_BUCKET_NAME=<your-s3-bucket-name>
     S3_REGION=<your-s3-region>
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   - Create a `.env.local` file in the `frontend` directory and add the following environment variables:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

- **`frontend/`**: Contains the Next.js application for the user interface.
  - **`src/app/`**: The main application pages and components.
  - **`src/components/`**: Reusable React components.
  - **`src/lib/`**: Utility functions and libraries.
- **`backend/`**: Contains the Node.js (Express) application for the API.
  - **`src/controllers/`**: Request handlers for different API routes.
  - **`src/models/`**: Mongoose schemas for the database models.
  - **`src/routes/`**: API route definitions.
  - **`src/middleware/`**: Custom middleware for authentication, etc.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.


