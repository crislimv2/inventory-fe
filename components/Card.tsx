import CardLeftPanel from "./CardLeftPanel";
import CardRightPanel from "./CardRightPanel";

const Card = () => {
  return (
    <div className="bg-white w-full h-screen flex items-center justify-between">
      <div className="bg-blue-200 w-3/4 h-full">
        <CardLeftPanel />
      </div>
      <div className="bg-yellow-200 w-1/4 h-full">
        <CardRightPanel />
      </div>
    </div>
  );
};

export default Card;
