export interface SortDialogProps {
  bookSortCode: { sort: number; order: number };
  noteSortCode: { sort: number; order: number };
  isSortDisplay: boolean;
  mode: string;
  shelfTitle: string; // manual sort (custom)
  handleBookSortCode: (bookSortCode: { sort: number; order: number }) => void;
  handleNoteSortCode: (bookSortCode: { sort: number; order: number }) => void;
  handleSortDisplay: (isSortDisplay: boolean) => void;
  handleFetchBooks: () => void;
  handleFetchNotes: () => void;
}
export interface SortDialogState {
  isNote: boolean;
  isManualDialogOpen: boolean; // manual sort (custom)
}
