export const NavBar = () => {
  return (
    <nav>
      <div className="nav nav-tabs" id="nav-tab" role="tablist">
        <button
          className="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#nav-home"
          role="tab"
          aria-controls="nav-home"
          aria-selected="true"
        >
          Data Processing
        </button>
        <button
          className="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-profile"
          role="tab"
          aria-controls="nav-profile"
          aria-selected="false"
        >
          Data Visualization
        </button>
      </div>
    </nav>
  );
};
