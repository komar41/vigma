import React, { useState } from "react";
import { GlobalContext } from "./GlobalContext";

const GlobalProvider = ({ children }) => {
  const [globalArray, setGlobalArray] = useState([]);
  const [globalArray2, setGlobalArray2] = useState([]);

  return (
    <GlobalContext.Provider
      value={{ globalArray, setGlobalArray, globalArray2, setGlobalArray2 }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
