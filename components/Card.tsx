import CardLeftPanel from "./CardLeftPanel";
import CardRightPanel from "./CardRightPanel";

const Card = () => {
  return (
    <div className="bg-white h-screen w-full flex">
      <div className="bg-blue-200 h-screen w-3/4 overflow-y-scroll">
        <CardLeftPanel />
      </div>
      <div className="bg-yellow-200 w-1/4 sticky top-0 h-screen overflow-y-scroll ">
        <CardRightPanel />
      </div>
    </div>
  );
};

export default Card;
