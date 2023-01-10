export type noteId = string;

export interface INote {
  Id: noteId;
  Notes: string;
  Address: string;
}

export type ILeafletNote = Omit<INote, "Address" | "Id">;
