

<div align="center">
  <h1 style="border-bottom: none; font-size: 2.8rem; font-weight: 800; color: #6a5af9; margin-bottom: 0.5rem;">ServiceSphere</h1>
  <p style="font-size: 1.2rem; color: #444; margin-bottom: 1.5rem;">A modern platform for discovering, booking, and managing local services.</p>
  <img src="back-end/screenshots/landing-page.png" alt="Landing Page Screenshot" style="max-width: 700px; border-radius: 16px; box-shadow: 0 4px 24px rgba(106,90,249,0.12); margin-bottom: 1.5rem;" />
</div>



## ✨ Features

- <b>Customer Portal</b>: Search, filter, and book services by category, location, and rating. View provider details and leave reviews.
- <b>Provider Dashboard</b>: Add, edit, and manage service listings. Set weekly availability, view bookings, and respond to customer requests.
- <b>Admin Dashboard</b>: Moderate service listings, approve/reject new services, view platform analytics, and manage users/providers.
- <b>Authentication</b>: Secure login and signup for customers, providers, and admins.
- <b>Image Uploads</b>: Providers can upload service images for better visibility.
- <b>Responsive UI</b>: Optimized for desktop and mobile devices.



## 🛠️ Tech Stack

- <b>Front-end</b>: React, CSS Modules, React Router, React Toastify
- <b>Back-end</b>: Node.js, Express, <b>MySQL</b>
- <b>APIs</b>: RESTful endpoints for all core features
- <b>Other</b>: JWT Authentication, Multer for image uploads



## 📁 Folder Structure

```text
Local_services_finder/
├── back-end/
│   ├── server.js           # Express server entry point
│   ├── Service.js          # Service model and logic
│   ├── package.json        # Backend dependencies
│   ├── uploads/            # Uploaded service images
│   └── ...
├── front-end/
│   ├── src/
│   │   ├── App.js
│   │   ├── AdminDashboard.js
│   │   ├── ProviderDashboard.js
│   │   ├── CustomerDashboard.js
│   │   ├── ...
│   ├── public/
│   ├── package.json        # Frontend dependencies
│   └── README.md
└── README.md               # Project overview
```



## 🏁 Getting Started

<details>
  <summary><b>Prerequisites</b></summary>
  <ul>
    <li>Node.js (v16+ recommended)</li>
    <li>npm or yarn</li>
    <li>MySQL (local or cloud)</li>
  </ul>
</details>

<details>
  <summary><b>Installation</b></summary>
  <ol>
    <li><b>Clone the repository</b><br>
      <code>git clone https://github.com/Rakesh0045/ServiceSphere.git</code><br>
      <code>cd ServiceSphere</code>
    </li>
    <li><b>Install dependencies</b><br>
      <b>Backend:</b><br>
      <code>cd back-end</code><br>
      <code>npm install</code><br>
      <b>Frontend:</b><br>
      <code>cd ../front-end</code><br>
      <code>npm install</code>
    </li>
    <li><b>Configure environment variables</b><br>
      Create a <code>.env</code> file in <code>back-end/</code> with your MySQL credentials and JWT secret:<br>
      <pre>
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name
JWT_SECRET=your_jwt_secret
PORT=5000
      </pre>
    </li>
    <li><b>Start the development servers</b><br>
      <b>Backend:</b><br>
      <code>cd back-end</code><br>
      <code>npm start</code><br>
      <b>Frontend:</b><br>
      <code>cd ../front-end</code><br>
      <code>npm start</code><br>
      The frontend runs on <code>http://localhost:3000</code> and backend on <code>http://localhost:5000</code>
    </li>
  </ol>
</details>



## 🎯 Usage

- <b>Customers</b>: Sign up, search for services, book appointments, and leave reviews.
- <b>Providers</b>: Register, create and manage service listings, set availability, and handle bookings.
- <b>Admins</b>: Log in to moderate services, approve/reject listings, and view analytics.



## 📡 API Endpoints (Sample)

<table>
  <tr><td><b>POST /api/auth/signup</b></td><td>Register a new user</td></tr>
  <tr><td><b>POST /api/auth/login</b></td><td>Login</td></tr>
  <tr><td><b>GET /api/services</b></td><td>List/search services</td></tr>
  <tr><td><b>POST /api/services</b></td><td>Add new service (provider)</td></tr>
  <tr><td><b>PUT /api/services/:id</b></td><td>Edit service</td></tr>
  <tr><td><b>DELETE /api/services/:id</b></td><td>Delete service</td></tr>
  <tr><td><b>GET /api/bookings</b></td><td>View bookings</td></tr>
  <tr><td><b>POST /api/bookings</b></td><td>Create booking</td></tr>
  <tr><td><b>PUT /api/bookings/:id/status</b></td><td>Update booking status</td></tr>
  <tr><td><b>GET /api/admin/services</b></td><td>Admin moderation</td></tr>
</table>



## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## 📄 License

This project is licensed under the MIT License.

## 📬 Contact

- Author: Rakesh0045
- GitHub: [ServiceSphere](https://github.com/Rakesh0045/ServiceSphere)

---

<div align="center" style="margin-top: 2rem;">
  <b style="font-size: 1.15rem; color: #6a5af9;">Empowering local service discovery and management.</b>
</div>
