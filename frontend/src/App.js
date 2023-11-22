import { DataProcessView } from "./components/data-process-view/data-process-view";
import "./App.css";

function App() {
  return (
    <>

      <div
        className="tab-content"
        id="nav-tabContent"
        // style={{ height: "96%" }}
      >
        <DataProcessView />
      </div>
    </>
  );
}

export default App;
