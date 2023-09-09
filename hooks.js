// Display a toast if the backend is offline
useEffect(() => {
  function checkHealth() {
    axios
      .get("/health/")
      .then(() => {
        toast.dismiss("health-check"); // if it was previously offline, dismiss the toast
      })
      .catch((err) => {
        console.log(err);
        showSnackbar(err.userMessage, "error", {
          toastId: "health-check",
          autoClose: false,
          closeOnClick: false,
        });
      });
  }
  const healthCheck = setInterval(checkHealth, 5000);
  checkHealth(); // run immediately on page load
  return () => clearInterval(healthCheck);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
