import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [jsonData, setJsonData] = useState("");

  useEffect(() => {
    console.log("run");
    ///api/get-assignments?timezone=your-timezone
    axios
      .post("http://localhost:5000/api/create-new-assignment-pages", {
        headers: {
          "Content-Type": "application/json",
          "Notion-Api-Key": "your-notion-api-key",
          "Canvas-Api-Key": "your-canvas-api-key",
        },
        params: {
          timezone: "your-timezone",
        },
      })
      .then((response) => {
        console.log(response.data);
        setJsonData("success");
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          setJsonData("error1");
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.message);
          setJsonData("error2");
        } else {
          // Something happened in setting up the request and triggered an Error
          console.log("Error", error.message);
          setJsonData("error3");
        }
      });
  }, []);

  return (
    <div>
      <p>{jsonData}</p>
    </div>
  );
};

export default App;
