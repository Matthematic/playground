import { Divider, Link } from "@mui/material";
import axios from "axios";

/**
 * Custom instance of axios
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

/**
 * customMessages is an array of objects, each object representing a different endpoint in the API.
 * Each object has two properties: 'pattern' and 'methods'.
 *
 * 'pattern' is a regex that matches the path of an endpoint. This is used to find the matching endpoint
 * when an error occurs. Regex is used so that parameters and query strings in the URL can be accounted for.
 *
 * 'methods' is an object that represents the different HTTP methods that can be used at the endpoint.
 * The keys are the method names (GET, POST, etc.) and the values are another object.
 *
 * This second object represents the different HTTP statuses that can be returned from the endpoint when using
 * the method. The keys are the status codes and the values are the custom error messages to display to the user.
 * There is also a 'default' key which is used if the status code of the error is not a key in the object.
 *
 * Example:
 * {
 *   pattern: /\/authentication\/self$/,
 *   methods: {
 *     GET: {
 *       default: "Failed to retrieve user information",
 *       401: "You must log in to retrieve user information",
 *     },
 *     POST: {
 *       default: "Failed to authenticate user",
 *       500: "There was a problem authenticating. Please try again later.",
 *     },
 *   },
 * }
 *
 * In this example, if a GET request to "/authentication/self" resulted in a 401 status, the user will see
 * "You must log in to retrieve user information". For any other status, they'll see "Failed to retrieve user information".
 * Similarly, if a POST request to the same endpoint resulted in a 500 status, the user will see
 * "There was a problem authenticating. Please try again later". For any other status, they'll see "Failed to authenticate user".
 */
const customMessages = [
  {
    pattern: /\/whoami\/$/,
    methods: {
      GET: {
        default:
          "The whoami endpoint is not available - please try again later.",
      },
    },
  },
  // ...
];

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    let message = "";
    let details = "";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.code === "ERR_NETWORK") {
        if (window.navigator.onLine) {
          message = "There is an issue trying to reach the server.";
        } else {
          message = "There is an issue with your internet connection.";
        }
      } else {
        for (let i = 0; i < customMessages.length; i++) {
          const { pattern, methods } = customMessages[i];
          if (pattern.test(error.response.config.url)) {
            const method = methods[error.response.config.method.toUpperCase()];
            if (method) {
              message = method[error.response.status] || method.default;
            }
            break;
          }
        }

        if (!message) {
          switch (error.response.status) {
            case 400:
              message =
                "Bad Request: The server could not understand the request due to invalid syntax.";
              break;
            case 401:
              message =
                "Unauthorized: You need to log in to perform this action.";
              break;
            case 404:
              message =
                "Not Found: The resource you were trying to reach could not be found on the server.";
              break;
            case 422:
              message =
                "Unprocessable Entity: There was a problem with the information provided.";
              break;
            case 500:
              message =
                "Internal Server Error: The server has encountered a situation it doesn't know how to handle.";
              break;
            case 504:
              message =
                "Gateway Timeout: The server, while acting as a gateway, did not receive a timely response.";
              break;
            default:
              message = "Something went wrong. Please try again later.";
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === "ECONNABORTED") {
        message = "A timeout has occurred while trying to reach the server.";
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
      message = "Network Error: Please check your internet connection.";
    }

    console.log(error);

    /** Component for displaying the formatted error information in a toast */
    const MessageDisplay = ({ message, details, code, showContact }) => {
      return (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {message}
          <br />
          {showContact ? (
            <>
              <Link
                href={`http://www.example.com`}
                underline="none"
                target="_blank"
              >
                Contact Support
              </Link>
              <br />
            </>
          ) : null}
          {`Code: ${code}`}
          {details ? (
            <>
              <br />
              <Divider />
              <br />
              {details}
            </>
          ) : null}
        </div>
      );
    };

    error.userMessage = (
      <MessageDisplay
        message={message}
        details={details}
        code={error.response?.status || error.code} // response won't exist for ERR_NETWORK
        showContact={true}
      />
    );
    return Promise.reject(error);
  }
);

export default instance;
