# Dashboard Maker

A modern, interactive dashboard builder application built with Spring Boot backend and React frontend. Create beautiful, customizable dashboards with various chart types and data visualization options.

## 🚀 Features

- **Interactive Dashboard Builder**: Drag-and-drop interface for creating custom dashboards
- **Multiple Chart Types**: Bar charts, line charts, pie charts, and data tables
- **Data Upload**: Support for CSV and Excel file uploads
- **Real-time Data Processing**: Dynamic chart rendering with filtering and aggregation
- **User Authentication**: JWT-based authentication system
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.x**: Java-based REST API
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database operations
- **PostgreSQL**: Primary database
- **JWT**: Token-based authentication
- **Maven**: Build tool

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for data visualization
- **React Grid Layout**: Drag-and-drop grid system

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17+**: [Download Java](https://adoptium.net/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **PostgreSQL 12+**: [Download PostgreSQL](https://www.postgresql.org/download/)
- **Maven 3.6+**: [Download Maven](https://maven.apache.org/download.cgi)
- **Docker** (optional): [Download Docker](https://www.docker.com/products/docker-desktop/)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dashboard-maker.git
   cd dashboard-maker
   ```

2. **Set up environment variables**
   ```bash
   # Copy example files
   cp backend/src/main/resources/application-example.properties backend/src/main/resources/application.properties
   cp frontend/env.example frontend/.env
   
   # Edit the files with your configuration
   # See Configuration section below
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dashboard-maker.git
   cd dashboard-maker
   ```

2. **Set up the database**
   ```sql
   CREATE DATABASE dashboardmaker;
   CREATE USER dashboarduser WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE dashboardmaker TO dashboarduser;
   ```

3. **Configure the backend**
   ```bash
   cd backend
   cp src/main/resources/application-example.properties src/main/resources/application.properties
   # Edit application.properties with your database credentials
   ```

4. **Configure the frontend**
   ```bash
   cd frontend
   cp env.example .env
   # Edit .env with your API URL
   ```

5. **Start the backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

## ⚙️ Configuration

### Environment Variables

#### Backend (application.properties)
```properties
# Database
spring.datasource.username=your-username
spring.datasource.password=your-password

# JWT Secret (generate a secure random string)
jwt.secret=your-super-secret-jwt-key-change-this-in-production

# CORS Origins (add your frontend URLs)
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

### Security Considerations

1. **Change default passwords**: Update database and JWT secrets
2. **Use environment variables**: Don't commit sensitive data to version control
3. **Configure CORS**: Restrict allowed origins in production
4. **Enable HTTPS**: Use SSL certificates in production

## 📊 Usage

### Creating Your First Dashboard

1. **Register/Login**: Create an account or sign in
2. **Upload Data**: Upload a CSV or Excel file with your data
3. **Create Dashboard**: Click "New Dashboard" to start building
4. **Add Charts**: Drag chart widgets onto the dashboard
5. **Configure Charts**: Set up axes, aggregation, and styling
6. **Save & Share**: Save your dashboard and share with others

### Supported File Formats

- **CSV**: Comma-separated values
- **Excel**: .xlsx and .xls files
- **Maximum file size**: 10MB

### Chart Types

- **Bar Chart**: Compare values across categories
- **Line Chart**: Show trends over time
- **Pie Chart**: Display proportions of a whole
- **Data Table**: Raw data display with sorting

## 🐳 Docker Deployment

### Production Deployment

1. **Build the images**
   ```bash
   docker-compose build
   ```

2. **Set production environment variables**
   ```bash
   export DB_PASSWORD=your-secure-password
   export JWT_SECRET=your-secure-jwt-secret
   export CORS_ORIGINS=https://yourdomain.com
   ```

3. **Run in production mode**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
dashboard-maker/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml            # Maven dependencies
├── frontend/               # React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/dashboard-maker/issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Basic dashboard functionality
- Support for bar, line, pie charts
- File upload and data processing
- User authentication system

---

**Made with ❤️ by [Your Name]** 