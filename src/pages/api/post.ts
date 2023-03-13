import type { NextApiRequest, NextApiResponse } from "next";
import { IPost,IPages } from "../../types/post";



export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPages>
) {
  const {time,start} = req.query;
  const dataArray: IPost[] = [];
  var date = new Date();

  var newdate= date.getDate() + '/' + (date.getMonth() +1)+ '/' +  date.getFullYear();
  for (let index = 0; index < 5; index++) {
    dataArray.push({
      _id: String(index),
      user: {
        _id: String(index),
        username: "shihab " + index,
        fullname: "Saiful Islam Shihab " + index,
        avatar: "https://random.imagecdn.app/500/200",
      },
      caption: "This is post caption "+time,
      image: "https://random.imagecdn.app/1920/1080",
      likes: Math.floor(Math.random() * 100) + index,
      comments: Math.floor(Math.random() * 100) + index,
      shares: Math.floor(Math.random() * 100) + index,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
 
  res.status(200).json({
    posts: dataArray,
    time: time+newdate,
    start: Number(start)+10
  });
}
