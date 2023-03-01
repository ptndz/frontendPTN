import type { NextApiRequest, NextApiResponse } from 'next'
export interface IUser {
    fullname: string;
    username: string;
    email: string;
    password: string;
    bio: string;
    dp: string;
    cover: string;
    hometown: string;
    currentCity: string;
    relationship: string;
    phone?: string;
    //   work: [IWork];
    //   education: [IEducation];
    //   website: [IWebsite];
    //   social: [ISocial];
    //   gender: IGender;
    //   interest: IInterest;
    //   religion: IReligion;
  }
  
  export interface IStory {
    _id: string;
    image: string;
    user: {
      _id: string;
      fullname: string;
      dp: string;
    };
    createdAt: Date;
  }


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
        dp: 'https://random.imagecdn.app/200/200',
      },
      createdAt: new Date(),
    },)
      
    }
    res.status(200).json(dataArray)
  }
  