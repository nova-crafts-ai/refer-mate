import { useAuth } from "@clerk/clerk-react";
import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router";

export const useAPIClient = (): AxiosInstance => {
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();

  const client = useMemo(() => {
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

    if (!baseURL) {
      throw new Error("VITE_BACKEND_BASE_URL is not defined");
    }

    const instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (!token) {
          navigate("/login");
          return Promise.reject("No auth token");
        }

        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          console.error(
            "Authentication expired or invalid. Prompting re-sign-in...",
          );
          await signOut();
          navigate("/login");
        }
        return Promise.reject(error);
      },
    );

    return instance;
  }, [getToken, navigate, signOut]);

  return client;
};
