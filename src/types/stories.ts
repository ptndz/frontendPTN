export interface IStory {
  _id: string;
  image: string;
  user: {
    _id: string;
    fullname: string;
    avatar: string;
  };
  createdAt: Date;
}
