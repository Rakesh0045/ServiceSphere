
# 🚀 ServiceSphere

A modern platform for discovering, booking, and managing local services. Built with a React front-end and Node.js/Express back-end, ServiceSphere enables customers to find trusted providers, book appointments, and leave reviews, while providers and admins manage listings and bookings efficiently.


## ✨ Features

- 👤 **Customer Portal**: Search, filter, and book services by category, location, and rating. View provider details and leave reviews.
- 🛠️ **Provider Dashboard**: Add, edit, and manage service listings. Set weekly availability, view bookings, and respond to customer requests.
- 🛡️ **Admin Dashboard**: Moderate service listings, approve/reject new services, view platform analytics, and manage users/providers.
- 🔒 **Authentication**: Secure login and signup for customers, providers, and admins.
- 🖼️ **Image Uploads**: Providers can upload service images for better visibility.
- 📱 **Responsive UI**: Optimized for desktop and mobile devices.


## 🛠️ Tech Stack

- 🎨 **Front-end**: React, CSS Modules, React Router, React Toastify
- ⚙️ **Back-end**: Node.js, Express, **MySQL**
- 🔗 **APIs**: RESTful endpoints for all core features
- 🛡️ **Other**: JWT Authentication, Multer for image uploads


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

### ⚡ Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MySQL (local or cloud)

### 📦 Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Rakesh0045/ServiceSphere.git
   cd ServiceSphere
   ```

2. **Install dependencies**
   - Backend:
     ```sh
     cd back-end
     npm install
     ```
   - Frontend:
     ```sh
     cd ../front-end
     npm install
     ```

3. **Configure environment variables**
   - Create a `.env` file in `back-end/` with your MySQL credentials and JWT secret:
     ```env
     MYSQL_HOST=localhost
     MYSQL_USER=your_mysql_user
     MYSQL_PASSWORD=your_mysql_password
     MYSQL_DATABASE=your_database_name
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

4. **Start the development servers**
   - Backend:
     ```sh
     cd back-end
     npm start
     ```
   - Frontend:
     ```sh
     cd ../front-end
     npm start
     ```
   - The frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`


## 🎯 Usage

- 👤 **Customers**: Sign up, search for services, book appointments, and leave reviews.
- 🛠️ **Providers**: Register, create and manage service listings, set availability, and handle bookings.
- 🛡️ **Admins**: Log in to moderate services, approve/reject listings, and view analytics.


## 📡 API Endpoints (Sample)

- 📝 `POST /api/auth/signup` — Register a new user
- 🔑 `POST /api/auth/login` — Login
- 🔍 `GET /api/services` — List/search services
- ➕ `POST /api/services` — Add new service (provider)
- ✏️ `PUT /api/services/:id` — Edit service
- 🗑️ `DELETE /api/services/:id` — Delete service
- 📅 `GET /api/bookings` — View bookings
- 📆 `POST /api/bookings` — Create booking
- 🔄 `PUT /api/bookings/:id/status` — Update booking status
- 🛡️ `GET /api/admin/services` — Admin moderation


## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## 📄 License

This project is licensed under the MIT License.

## 📬 Contact

- Author: Rakesh0045
- GitHub: [ServiceSphere](https://github.com/Rakesh0045/ServiceSphere)

---

<p align="center">
  <b>Empowering local service discovery and management.</b> <br>
  <img src="https://img.shields.io/badge/ServiceSphere-Local%20Services-blueviolet?style=for-the-badge" alt="ServiceSphere Badge" />
</p>
