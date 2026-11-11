export interface SortBookManualDialogProps {
  handleClose: () => void;
  t: (title: string) => string;
}
export interface SortBookManualDialogState {
  bookList: {
    id: number;
    key: string;
    name: string;
    author: string;
  }[];
}
