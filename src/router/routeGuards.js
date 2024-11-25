import { isSidebarOpen } from "@/utils/utils";
import store from "../store/store";
import Swal from "sweetalert2";

function isAuthenticated(to, from, next) {
  const authToken = localStorage.getItem("authToken");
  isSidebarOpen.value = false;

  if (authToken) {
    try {
      const base64Url = authToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedToken = JSON.parse(atob(base64));

      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (decodedToken.exp > currentTimestamp) {
        // Token is not expired
        store.commit("setAuthToken", authToken);
        next();
      } else {
        // Token is expired
        Swal.fire({
          title: "Session has expired",
          text: "Please log in again.",
          icon: "info",
          timerProgressBar: true,
        });
        store.commit("clearAuthToken");
        localStorage.clear();
        next({ name: "login" });
      }
    } catch (error) {
      // Error decoding token
      console.error("Error decoding token:", error);
      Swal.fire({
        title: "Error decoding token",
        text: "Please log in again.",
        icon: "info",
        timerProgressBar: true,
      });
      store.commit("clearAuthToken");
      localStorage.clear();
      next({ name: "login" });
    }
  } else {
    // No token available
    Swal.fire({
      title: "Session has expired",
      text: "Please log in again.",
      icon: "info",
      timerProgressBar: true,
    });
    localStorage.clear();
    next({ name: "login" });
  }
}

export default isAuthenticated;
