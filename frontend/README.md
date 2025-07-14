# Dashboard Builder Frontend

A complete React frontend application for building custom dashboards with data visualization capabilities.

## Features

- **User Authentication**: JWT-based login/register system
- **Data Management**: Upload CSV/Excel files or enter data manually
- **Chart Creation**: Support for bar charts, line charts, pie charts, and tables
- **Dashboard Builder**: Drag-and-drop interface using react-grid-layout
- **Data Visualization**: Charts rendered with Recharts library
- **Dashboard Sharing**: Public sharing with secure links
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Grid Layout** for drag-and-drop functionality
- **React Hook Form** with Yup validation
- **Axios** for API communication
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A running Spring Boot backend (see backend requirements below)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend URL:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Backend Requirements

This frontend expects a Spring Boot backend with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dataset Endpoints
- `GET /api/datasets` - Get user's datasets
- `GET /api/datasets/{id}` - Get specific dataset
- `POST /api/datasets` - Create dataset from manual data
- `POST /api/datasets/upload` - Upload CSV/Excel file
- `DELETE /api/datasets/{id}` - Delete dataset

### Dashboard Endpoints
- `GET /api/dashboards` - Get user's dashboards
- `GET /api/dashboards/{id}` - Get specific dashboard
- `GET /api/dashboards/public/{publicId}` - Get public dashboard
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/{id}` - Update dashboard
- `DELETE /api/dashboards/{id}` - Delete dashboard
- `POST /api/dashboards/{id}/share` - Share dashboard
- `POST /api/dashboards/{id}/unshare` - Unshare dashboard

### Expected Data Models

#### User
```json
{
  "id": 1,
  "username": "user123",
  "email": "user@example.com"
}
```

#### Dataset
```json
{
  "id": 1,
  "name": "Sales Data",
  "columns": ["Month", "Sales", "Profit"],
  "data": [
    {"Month": "Jan", "Sales": 1000, "Profit": 200},
    {"Month": "Feb", "Sales": 1200, "Profit": 300}
  ],
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Dashboard
```json
{
  "id": 1,
  "name": "Sales Dashboard",
  "description": "Monthly sales overview",
  "widgets": [
    {
      "i": "chart-1",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 4,
      "chartConfig": {
        "id": "chart-1",
        "type": "bar",
        "title": "Monthly Sales",
        "datasetId": 1,
        "xAxis": "Month",
        "yAxis": "Sales",
        "settings": {
          "width": 600,
          "height": 400
        }
      }
    }
  ],
  "userId": 1,
  "isPublic": false,
  "publicId": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Charts/         # Chart rendering and configuration
│   ├── Data/           # Data upload and grid components
│   ├── Dashboard/      # Dashboard builder components
│   └── Layout/         # Layout components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## Key Components

### Authentication
- `LoginForm` - User login interface
- `RegisterForm` - User registration interface
- `ProtectedRoute` - Route protection wrapper
- `AuthContext` - Authentication state management

### Data Management
- `FileUpload` - CSV/Excel file upload with drag-and-drop
- `DataGrid` - Manual data entry with editable table
- `ChartRenderer` - Renders different chart types using Recharts

### Dashboard Builder
- `DashboardBuilder` - Main dashboard creation/editing interface
- `ChartConfigModal` - Chart configuration modal
- Drag-and-drop grid layout for arranging charts

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.