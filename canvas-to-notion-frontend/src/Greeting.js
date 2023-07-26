import React, { useState, useEffect } from "react";
import axios from "axios";

function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/hello-world`)
      .then((response) => {
        setGreeting(response.data.greeting);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  return (
    <div>
      <h1>{greeting}</h1>
    </div>
  );
}

export default Greeting;
