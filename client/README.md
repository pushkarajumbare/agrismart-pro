# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Vercel and Render service configuration

Set these frontend build environment variables in Vercel, then redeploy:

```text
REACT_APP_API_URL=https://agrismart-pro-3.onrender.com
REACT_APP_PYTHON_API_URL=https://agrismart-pro-2.onrender.com
```

The frontend defaults to these Render service URLs if the variables are omitted. To adjust the bounded startup wake-up behavior, you may also set (values are milliseconds):

```text
REACT_APP_BACKEND_WAKE_TIMEOUT_MS=120000
REACT_APP_HEALTH_REQUEST_TIMEOUT_MS=10000
REACT_APP_HEALTH_RETRY_BASE_MS=1000
REACT_APP_HEALTH_RETRY_MAX_MS=10000
```

On both Render services, set `CLIENT_URL` to the production Vercel origin:

```text
CLIENT_URL=https://agrismart-pro.vercel.app
```

The Node service also allows `http://localhost:3000` and `http://127.0.0.1:3000` for local development. Optional comma-separated Vercel preview origins can be added to either Render service as `CLIENT_URLS`. Keep the Node service's existing `PYTHON_API_URL` and `AI_SERVICE_URL` values pointing at the Python Render service. Do not put MongoDB credentials, OpenWeather keys, or Gemini keys in Vercel; keep secrets in Render.

The app checks the Node API at `/api/health` and independently wakes the Python AI service at `/health`. Render may still need time to start a free service after inactivity; AgriSmart handles that cold start automatically with bounded retries.

`/api/health` reports Node process liveness only. The current Node server explicitly runs without MongoDB initialization, so this endpoint does not claim MongoDB readiness; no MongoDB readiness check currently exists.
