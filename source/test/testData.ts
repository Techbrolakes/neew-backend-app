import { IPostDocument } from "../models/post.model";
import { IUserDocument } from "../models/user.model";

const data = {
  userOla: {
    doc: undefined as IUserDocument | undefined,
    post: undefined as IPostDocument | undefined,
    token: "",
  },
  userDavid: {
    doc: undefined as IUserDocument | undefined,
    post: undefined as IPostDocument | undefined,
    token: "",
  },
};

export default data;
