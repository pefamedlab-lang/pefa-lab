export const getUserSession =
  () => {
    try {
      const session =
        localStorage.getItem(
          "pefa_user_session"
        );

      if (!session)
        return null;

      return JSON.parse(
        session
      );
    } catch (
      error
    ) {
      console.error(
        "Session Error:",
        error
      );

      return null;
    }
  };

export const setUserSession =
  (userData) => {
    localStorage.setItem(
      "pefa_user_session",
      JSON.stringify(
        userData
      )
    );
  };

export const clearUserSession =
  () => {
    localStorage.removeItem(
      "pefa_user_session"
    );
  };