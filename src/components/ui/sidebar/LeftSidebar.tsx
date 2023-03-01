import React from "react";
import Image from "next/image";
const LeftSidebar: React.FC = () => {
  return (
    <div className="w-9/12 h-auto py-3">
      <ul className="w-full text-gray-600">
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://random.imagecdn.app/200/200"
              alt="user"
              width={"200"}
              height={"200"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Saiful Islam Shihab</p>
          </div>
        </li>
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://static.xx.fbcdn.net/rsrc.php/v3/yR/r/tInzwsw2pVX.png"
              alt="info"
              width={"54"}
              height={"54"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Covid-19 Information Center</p>
          </div>
        </li>
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://static.xx.fbcdn.net/rsrc.php/v3/yx/r/-XF4FQcre_i.png"
              alt="friends"
              width={"54"}
              height={"54"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Friends</p>
          </div>
        </li>
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png"
              alt="memories"
              width={"54"}
              height={"54"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Memories</p>
          </div>
        </li>
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://static.xx.fbcdn.net/rsrc.php/v3/yZ/r/i7hepQ2OeZg.png"
              alt="pages"
              width={"54"}
              height={"54"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Pages</p>
          </div>
        </li>
        <li className="h-12 mb-2 flex items-center justify-content cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-200">
          <div>
            <Image
              className="w-8 h-8 rounded-full"
              src="https://static.xx.fbcdn.net/rsrc.php/v3/yD/r/mk4dH3FK0jT.png"
              alt="groups"
              width={"54"}
              height={"54"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Groups</p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;
