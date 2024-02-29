
function ImageTile({ imageName, imagePath }) {
  return (
    <div className="image-tile">
      <h2>{imageName}</h2>
      <img src={imagePath} alt={imageName} />
    </div>
  );
}

export default ImageTile;
