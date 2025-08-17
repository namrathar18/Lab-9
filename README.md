# Hospital Management System 🏥

A full-stack web application for hospital patient management with user registration, email confirmation, and complete CRUD operations.

## 📋 Features

- **Patient Registration** with profile picture upload
- **Email Confirmation** after successful registration
- **Complete CRUD Operations** (Create, Read, Update, Delete)
- **Profile Picture Management** using Multer
- **Responsive Design** with TailwindCSS
- **REST API** endpoints for all operations
- **MySQL Database** integration

## 🛠️ Technology Stack

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **API**: RESTful API endpoints

## 📁 Project Structure

```
hospital-management/
├── app.js                 # Main server file
├── index.html            # Frontend HTML file
├── package.json          # Dependencies
├── .env                  # Environment variables
├── uploads/              # Profile pictures storage
└── README.md            # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd hospital-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Start MySQL server
2. Create database:
```sql
CREATE DATABASE hospital_db;
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hospital_db

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

PORT=3000
```

#### Gmail App Password Setup:
1. Enable 2-Factor Authentication on your Gmail
2. Go to Google Account Settings > Security > App Passwords
3. Generate an app password for "Mail"
4. Use this app password in EMAIL_PASS

### 5. Run the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Patient Registration
- **POST** `/api/patients`
- **Body**: FormData (name, email, phone, profilePicture)
- **Response**: Success message with patient ID

### Get All Patients
- **GET** `/api/patients`
- **Response**: Array of all patients

### Get Single Patient
- **GET** `/api/patients/:id`
- **Response**: Patient object

### Update Patient
- **PUT** `/api/patients/:id`
- **Body**: FormData (name, email, phone, profilePicture)
- **Response**: Success message

### Delete Patient
- **DELETE** `/api/patients/:id`
- **Response**: Success message

## 🧪 API Testing

### Using Postman
1. Import the following endpoints:
   - POST `http://localhost:3000/api/patients`
   - GET `http://localhost:3000/api/patients`
   - GET `http://localhost:3000/api/patients/1`
   - PUT `http://localhost:3000/api/patients/1`
   - DELETE `http://localhost:3000/api/patients/1`

### Using Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create new requests for each endpoint
3. For POST/PUT requests, use form-data to include file uploads

### Sample API Test Data
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

## 🎯 Usage

1. **Register Patient**: Fill in the registration form with name, email, phone, and upload a profile picture
2. **Email Confirmation**: Check your email for registration confirmation
3. **View Patients**: All registered patients are displayed in a responsive grid
4. **Edit Patient**: Click edit button to modify patient information
5. **Delete Patient**: Click delete button to remove a patient (with confirmation)

## 📂 File Upload Details

- **Storage**: Local filesystem in `/uploads` directory
- **File Types**: Images only (jpg, jpeg, png, gif)
- **File Size**: Maximum 5MB
- **Naming**: Unique filename with timestamp prefix

## 🔧 Development Tools

- **Nodemon**: Auto-restart server on file changes
- **CORS**: Cross-Origin Resource Sharing enabled
- **Multer**: File upload handling
- **Express**: Web framework
- **MySQL2**: MySQL database driver

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check MySQL server is running
   - Verify database credentials in .env file
   - Ensure database 'hospital_db' exists

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Confirm EMAIL_USER and EMAIL_PASS in .env

3. **File Upload Issues**
   - Ensure 'uploads' directory exists
   - Check file permissions
   - Verify file size is under 5MB

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:3000 | xargs kill -9`

## 🔐 Security Features

- Input validation and sanitization
- File type restrictions for uploads
- SQL injection prevention with prepared statements
- Unique email constraint
- Error handling for all operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Namratha R**
- Email: namratharajashekar18@gmail.com


---

⭐ If you found this project helpful, please give it a star!