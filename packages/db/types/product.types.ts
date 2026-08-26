import { HydratedDocument, Types } from "mongoose";

export enum ProductKind {
  PHYSICAL = "physical",
  DIGITAL = "digital",
}

export interface Iproduct {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  project?: Types.ObjectId;
  name: string;
  images: string[];
  description: string;
  url: string;
  price: number;
  kind: ProductKind;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Iproduct>;
