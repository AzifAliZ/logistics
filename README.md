# Logistics Order Management System

A full-stack application for tracking and managing logistics orders. This system allows merchants and customers to track the lifecycle of an order from creation to delivery, featuring real-time updates and simulated email notifications.

## 🚀 Features

*   **📦 Order Management**: Create, list, and filter orders by status, merchant, or customer.
*   **🔄 Real-time Updates**: The dashboard automatically polls for updates, ensuring you see status changes as they happen.
*   **📧 Email Simulation**:
    *   **Backend**: Simulates sending emails via the Django console backend. Full email logs (headers + body) are visible in the server terminal.
    *   **Frontend**: Receive instant "Toast" popups confirming email delivery details whenever an order status is updated.
*   **📜 History Tracking**: Every status change is recorded with a timestamp and source, providing a full audit trail.
*   **🔍 Advanced Filtering**: Filter orders by Status, Date Range, Merchant, or Customer.

## 📂 Project Structure

The project is divided into two main components:

*   **`logistics_backend/`**: A **Django REST Framework** API that handles database interactions, business logic, and email simulation.
*   **`logistics-frontend/`**: A **React** application (using Bootstrap) that provides a user-friendly interface for managing orders.

## 🛠️ Setup & Running

### Prerequisites
*   Python 3.8+
*   Node.js & npm

### 1. Backend Setup (Django)

```bash
cd logistics_backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies (assuming you have a requirements.txt, otherwise manually)
pip install django djangorestframework django-cors-headers

# Run Migrations
python manage.py migrate

# Start the Server
python manage.py runserver
```
The API will be available at `http://localhost:8000/api/`.

### 2. Frontend Setup (React)

```bash
cd logistics-frontend

# Install dependencies
npm install

# Start the Development Server
npm start
```
The application will open at `http://localhost:3000`.

## 🧪 Testing Email Simulation

1.  Open the **Order List** in your browser.
2.  Click **View** on any order.
3.  Click **Update Status** and change the status (e.g., to "In Transit").
4.  **Observe**:
    *   A **Green Popup** (Toast) will appear in the top-right corner saying "Status Updated!" and showing the "Email Sent" status.
    *   Check your **Backend Terminal**: You will see the full raw email log being printed.

## 📝 API Endpoints

*   `GET /api/orders/list/` - List all orders (supports filtering)
*   `POST /api/orders/` - Create a new order
*   `GET /api/orders/{id}/` - Get order details
*   `GET /api/orders/{id}/history/` - Get status history
*   `POST /api/orders/{id}/status/` - Update order status
