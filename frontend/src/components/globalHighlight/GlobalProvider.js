import React, { useState } from "react";
import { GlobalContext } from "./GlobalContext";

const GlobalProvider = ({ children }) => {
  const [globalArray, setGlobalArray] = useState([]);
  const [globalArray2, setGlobalArray2] = useState([]);
  const [globalArrayVideo, setGlobalArrayVideo] = useState([]);
  const [globalArray2Video, setGlobalArray2Video] = useState([]);

  return (
    <GlobalContext.Provider
      value={{
        globalArray,
        setGlobalArray,
        globalArray2,
        setGlobalArray2,
        globalArrayVideo,
        setGlobalArrayVideo,
        globalArray2Video,
        setGlobalArray2Video,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
