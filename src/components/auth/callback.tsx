import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

function Callback() {
    const { handleRedirectCallback } = useAuth0();
  
    useEffect(() => {
      const processRedirect = async () => {
        await handleRedirectCallback();
        // Redirect to home or other page after successful login
        window.location.replace('/');
      };
      processRedirect();
    }, [handleRedirectCallback]);
  
    return <div>Loading...</div>; // Or a loading spinner
  }

  export default Callback