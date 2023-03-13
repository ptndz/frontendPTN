import type { NextApiRequest, NextApiResponse } from 'next'
import {IStory} from "../../types/stories"

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<IStory[]>
  ) {
    const dataArray : IStory[] =[]
    for (let index = 0; index < 6; index++) {
     dataArray.push( {
      _id: String(index),
      image: 'https://random.imagecdn.app/200/300',
      user: {
        _id: String(index),
        fullname: 'Saiful Islam '+index,
        avatar: 'https://random.imagecdn.app/200/200',
      },
      createdAt: new Date(),
    },)
      
    }
    res.status(200).json(dataArray)
  }
  