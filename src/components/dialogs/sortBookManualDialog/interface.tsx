export interface SortBookManualDialogProps {
  handleClose: () => void;
  t: (title: string) => string;
  // manual sort (custom): current view, used to restrict the list to what the
  // user is actually looking at (all books / a shelf / favorites)
  mode?: string;
  shelfTitle?: string;
}
export interface SortBookManualDialogState {
  bookList: {
    id: number;
    key: string;
    name: string;
    author: string;
  }[];
  // manual sort (custom): full library order, kept so that reordering inside a
  // shelf does not disturb the position of books outside that shelf
  fullOrder: string[];
}
