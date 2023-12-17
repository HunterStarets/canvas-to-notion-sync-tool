import React, { useEffect, useState } from "react";
import axios from "axios";

const ApiMapKeys = () => {
  const [mapKeys, setMapKeys] = useState([]);

  useEffect(() => {
    // Function to make the GET request to the API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get-assignments"
        );
        const mapData = response.data; // Assuming the API response is a map
        const keys = Object.keys(mapData);
        console.log("responses: " + mapData.toString());

        setMapKeys(keys);
      } catch (error) {
        console.error("Error fetching data from the API:", error);
      }
    };

    fetchData(); // Call the function to fetch data when the component mounts
  }, []);

  return (
    <div>
      <h1>Keys from the Map:</h1>
      <ul>
        <p>test</p>
        {mapKeys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}
      </ul>
    </div>
  );
};

export default ApiMapKeys;
