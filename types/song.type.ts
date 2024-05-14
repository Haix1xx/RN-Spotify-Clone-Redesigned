import { IUser } from "./user.type";

export interface Song {
  _id: string;
  title: string;
  url: string;
  coverPath: string;
  releaseDate: Date;
  isPublic: boolean;
  duration: number;
  totalStreams: number;
  album: string;
  collaborators: any[];
  writtenBy: string;
  producedBy: string;
  source: string;
  copyRight: string;
  publishRight: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  id: string;
  artist: IUser;
}
