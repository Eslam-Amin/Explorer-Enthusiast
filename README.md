# Explorer Enthusiast

 Explorer Enthusiast is a backend application designed to manage and explore tours. It provides CRUD operations for tours, allows users to view tours and their locations using MapBox, and includes authentication and authorization using JWT.

## Features

- **Tours Management**: Create, read, update, and delete tours.
- **User Roles**: Assign roles such as lead-guide and tour guide to users.
- **Location Viewing**: Display the location of each tour using MapBox.
- **Authentication & Authorization**: Secure user authentication and role-based access control using JWT.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database.
- **Mongoose**: ODM for MongoDB.
- **Pug**: Template engine for server-side rendering.
- **MapBox**: Map service to display tour locations.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/TourExplorer.git
    cd TourExplorer
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root directory and add the following:

    ```env
    NODE_ENV=development
    PORT=3000
    DATABASE=mongodb://localhost:27017/tourexplorer
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=90d
    ```

4. Start the server:

    ```sh
    npm start
    ```

### Usage

- **Create a Tour**: POST `/api/v1/tours`
- **Get All Tours**: GET `/api/v1/tours`
- **Get a Tour**: GET `/api/v1/tours/:id`
- **Update a Tour**: PATCH `/api/v1/tours/:id`
- **Delete a Tour**: DELETE `/api/v1/tours/:id`

### Authentication

- **Sign Up**: POST `/api/v1/users/signup`
- **Login**: POST `/api/v1/users/login`


## Future Work

- **Email Notifications**: Implement functionality to send emails.
- **Image Uploads**: Enable image uploads using Multer.
- **Payments Integration**: Integrate payment processing with Stripe or Paymob.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE]([LICENSE](https://github.com/Eslam-Amin/Explorer-Enthusiast/blob/master/LICENSE.md)) file for details.

