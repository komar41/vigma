import React, { useState } from "react";
import { GlobalContext } from "./GlobalContext";

const GlobalProvider = ({ children }) => {
  const [globalArray, setGlobalArray] = useState(["initial value"]);

  return (
    <GlobalContext.Provider value={{ globalArray, setGlobalArray }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
