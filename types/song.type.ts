import { EMEDIA } from "../constants/mediaItems";
import { IUser } from "./user.type";

export interface Song {
  type: EMEDIA;
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
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  displayname: string;
  __v: number;
  id: string;
  artist: IUser;
}
