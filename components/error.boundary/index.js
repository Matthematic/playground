import React from "react";
import ErrorFallback from "./error.fallback";

/**
 * The ErrorBoundary is designed to catch exceptions that are thrown
 * by its children during render lifecycle. In the event an exception is thrown,
 * a styled status component will be rendered to communicate the exception to the
 * user.
 *
 * Unlike a standard error boundary, the error is not persisted within the
 * ErrorBoundary's state. The ErrorBoundary will attempt to
 * render its children each time it is updated. Resetting the ErrorBoundary
 * by using a key is not necessary.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.resetError = () => {
      this.errorRef.current = undefined;
      if (this.state.error) {
        this.setState({ error: undefined });
      }
    };

    this.errorRef = React.createRef();

    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidMount() {
    this.resetError();
  }

  componentDidUpdate() {
    this.resetError();
  }

  componentDidCatch(error) {
    /**
     * If the ErrorBoundary was updated due to a caught exception, this lifecycle method will be
     * executed. componentDidCatch executes after componentDidMount/componentDidUpdate, so this is executing
     * after the error state has been reset.
     *
     * The error that was caught is stored in a ref and the error within state is cleared. This causes
     * the ErrorBoundary to update again to ensure that the StatusView remains presented until the
     * next update occurs.
     */
    this.errorRef.current = error;
    this.setState({ error: undefined });
  }

  render() {
    const { children, message, isTriggered } = this.props;
    const activeError =
      isTriggered || this.state.error || this.errorRef.current;

    if (activeError) {
      return <ErrorFallback message={message} />;
    }

    return children;
  }
}

export default ErrorBoundary;
