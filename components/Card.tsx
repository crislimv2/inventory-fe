import CardLeftPanel from "./CardLeftPanel";
import CardRightPanel from "./CardRightPanel";

const Card = () => {
  return (
    <div className="bg-white w-full h-screen flex items-center justify-between">
      <div className="bg-blue-200 w-3/4 h-full overflow-y-scroll">
        <CardLeftPanel />
      </div>
      <div className="bg-yellow-200 w-1/4 h-screen sticky top-0">
        <CardRightPanel />
      </div>
    </div>
  );
};

export default Card;
