# Beginner to Ninja Frontend Projects Using React

This repository contains a collection of beginner to advanced **frontend projects** developed using **React**, and serves as the **frontend companion** to the [`backend-projects`](https://github.com/AgPriyanshu/backend-projects) repository. Each project in this repo corresponds to a backend project and is built as a **microfrontend**, making it modular, scalable, and easy to integrate.

## Purpose

The primary goal of this repository is to provide a structured way for developers to practice and improve their **frontend development** skills by building real-world applications. Each microfrontend covers essential concepts such as:

- Component-Based Architecture
- State Management
- API Integration with Backend Services
- Responsive & Accessible UI
- Authentication & Authorization Workflows
- Real-Time UI with WebSockets
- UI/UX Best Practices

By mirroring the backend apps in the [`backend-projects`](https://github.com/AgPriyanshu/backend-projects) repo, this collection allows for full-stack development practice, using a **decoupled microfrontend architecture**.

## Projects Covered

Each frontend project corresponds to a backend service in the [`backend-projects`](https://github.com/AgPriyanshu/backend-projects) repository:

1. **URL Shortener UI**: Microfrontend for creating and managing short URLs with analytics dashboards.
2. **File Sharing UI**: Frontend for uploading, sharing, and managing files securely.
3. **Auth System UI**: React interface for user registration, login, and JWT-based authentication.
4. **Social Media UI**: A basic social media feed, post interactions, and user profiles.
5. **Chat App UI**: Real-time messaging interface integrated with WebSocket backend.
6. **Task Queue Dashboard**: Admin UI for monitoring and triggering background jobs.
7. **Blog Platform UI**: Blogging interface with rich content creation and social interactions.
8. **E-Commerce UI**: Storefront, cart, and checkout UI integrated with payment APIs.

... and more to come!

## Technologies Used

Each project is built using modern frontend technologies including:

- **React**: Core UI library for building components.
- **Vite** / **CRA**: Tooling for fast development and builds.
- **Tailwind CSS** / **Styled Components**: Utility-first and modular styling.
- **React Router**: For single-page app routing.
- **Axios**: For making secure API requests to backend services.
- **Context API** / **Redux**: For scalable state management.
- **Jest** & **React Testing Library**: For reliable unit and integration testing.

## How to Use

1. Clone the repository:
    ```bash
    git clone https://github.com/AgPriyanshu/frontend-projects.git
    ```
2. Navigate into the project directory you want to run.
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```

> Make sure the corresponding backend service is running from [`backend-projects`](https://github.com/AgPriyanshu/backend-projects) for full functionality.

## Microfrontend Architecture

Each project is developed as an **independent microfrontend**. This allows:

- Independent deployment and scaling
- Clear separation of concerns
- Easier testing and maintenance
- Seamless integration with backend microservices

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance existing microfrontends or add new ones.

## License

This repository is licensed under the MIT License.
