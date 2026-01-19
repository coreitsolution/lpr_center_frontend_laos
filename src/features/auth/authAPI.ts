import { fetchClient, combineURL } from "../../utils/fetchClient"
import { LoginCredentials, LoginResponse, RefreshTokenResponse } from "./authTypes";

// Config
import { getUrls } from '../../config/runtimeConfig';

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { CENTER_API } = getUrls();
  return await fetchClient<LoginResponse>(combineURL(CENTER_API, "/users/login"), {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  const { CENTER_API } = getUrls();
  return await fetchClient<RefreshTokenResponse>(combineURL(CENTER_API, "/users/refresh"), {
    method: 'POST',
  });
}

export const logoutUser = async (): Promise<{ success: boolean }> => {
  const { CENTER_API } = getUrls();
  await fetchClient<void>(combineURL(CENTER_API, "/users/logout"), {
    method: "POST",
  });
  return { success: true }
};