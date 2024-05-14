export interface IUser {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  verifyToken: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  refreshToken: string;
  profile: Profile;
}

export interface Profile {
  _id: string;
  bio: string;
  images: any[];
  popularTracks: any[];
  firstname: string;
  lastname: string;
  gender: boolean;
  avatar: string;
  birthday: Date;
  user: string;
  __t: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  displayname: string;
  id: string;
}
