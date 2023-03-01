import type { NextApiRequest, NextApiResponse } from "next";
export type TPostView = "gridView" | "listView";

export interface IPost {
  _id: string;
  user: {
    _id: string;
    fullname: string;
    username: string;
    dp: string;
  };
  caption?: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    posts: IPost[];
    time: string;
  }>
) {
  const time = req.query.time;
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
        dp: "https://random.imagecdn.app/500/200",
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
  });
}
