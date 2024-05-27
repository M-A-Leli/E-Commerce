# E-Commerce

This project consists of a frontend and a backend. The frontend is built with HTML, CSS, and TypeScript, and the backend contains a `db.json` served by the `json-server` package. The project uses `concurrently` to run both the frontend and backend simultaneously.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Project Structure

- E-Commerce/
  - backend/
    - db.json
    - package.json
    - ... (other backend files)
  - frontend/
    - dist/
    - src/
      - pages/
        - ... (html files)
      - scripts/
        - ... (ts files)
      - styles/
        - ... (css files)
      - index.html
    - package.json
    - bs-config.json
    - tsconfig.json
    - ... (other frontend files)
  - package.json
  - ... (other root-level files)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/M-A-Leli/E-Commerce.git
```
```bash
cd E-Commerce
```

### 2. Install Dependencies

Run the following command in the root directory to install all dependencies for the root, frontend, and backend:

```bash
npm install
```

This command will:

- Install root dependencies.
- Install frontend dependencies by running `npm install --prefix frontend`.
- Install backend dependencies by running `npm install --prefix backend`.

### 3. Start the Project

After the dependencies are installed, you can start both the frontend and backend servers concurrently with the following command:

```bash
npm start
```

This will run:
- `npm run start:frontend` to start the frontend server.
- `npm run start:backend` to start the backend server.

### 4. Access the Application

- **Frontend:** Open your browser and navigate to [http://localhost:3001](http://localhost:3001) (or the port specified in your frontend configuration). By default, lite-server is configured to use port 3001 in `bs-config.json`.

- **Backend:** The backend server will run on [http://localhost:3000](http://localhost:3000) (or the port specified in your backend configuration). By default, json-server uses port 3000.

## Scripts

### Root Scripts

- `npm start`: Runs both the frontend and backend concurrently.
- `npm run start:frontend`: Runs the frontend server.
- `npm run start:backend`: Runs the backend server.
- `npm run postinstall`: Automatically installs dependencies in both the frontend and backend directories after the root installation.

### Frontend Scripts

Defined in `frontend/package.json`:

- `npm start`: Builds the frontend and serves it using lite-server.

### Backend Scripts

Defined in `backend/package.json`:

- `npm start`: Starts json-server.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
