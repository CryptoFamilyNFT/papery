import { ILink } from "./ILink";

export interface IToast {
  toastId?: string;
  toastStatus?: string;
  toastTitle?: string;
  toastDescription?: string;
  toastLink?: ILink;
}
