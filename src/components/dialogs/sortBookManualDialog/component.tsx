import React from "react";
import { Trans } from "react-i18next";
import { ReactSortable } from "react-sortablejs";
import { ConfigService } from "../../../assets/lib/kookit-extra-browser.min";
import DatabaseService from "../../../utils/storage/databaseService";
import {
  SortBookManualDialogProps,
  SortBookManualDialogState,
} from "./interface";
import "../sortShelfDialog/sortShelfDialog.css";
import "./sortBookManualDialog.css";

class SortBookManualDialog extends React.Component<
  SortBookManualDialogProps,
  SortBookManualDialogState
> {
  // manual sort (custom): latest drag result, kept outside state so that
  // onEnd always sees the final order even if setState has not committed yet
  private pendingKeys: string[] | null = null;

  constructor(props: SortBookManualDialogProps) {
    super(props);
    this.state = {
      bookList: [],
      fullOrder: [], // manual sort (custom)
    };
  }

  componentDidMount = async () => {
    await this.loadBookList();
  };

  // manual sort (custom): the keys that are visible in the current view.
  // Mirrors the filtering used by bookList (shelf first, then favorites),
  // returns null when the whole library is displayed.
  getScopeKeys = (): Set<string> | null => {
    const { mode, shelfTitle } = this.props;
    if (shelfTitle) {
      const shelfList: string[] =
        ConfigService.getMapConfig(shelfTitle, "shelfList") || [];
      return new Set(shelfList);
    }
    if (mode === "favorite") {
      const favoriteList: string[] =
        ConfigService.getAllListConfig("favoriteBooks") || [];
      return new Set(favoriteList);
    }
    return null;
  };

  loadBookList = async () => {
    // books still in the library (skip deleted ones)
    const deletedBookKeys =
      ConfigService.getAllListConfig("deletedBooks") || [];
    const allBooks: any[] = await DatabaseService.getAllRecords("books");
    const validBooks = allBooks.filter(
      (book) => !deletedBookKeys.includes(book.key) && book.name
    );
    // user-defined order first, then books not arranged yet
    const manualKeys = ConfigService.getAllListConfig("sortedBookList") || [];
    const bookMap = new Map<string, any>(
      validBooks.map((book) => [book.key, book])
    );
    const fullOrder: string[] = [
      ...manualKeys.filter((key: string) => bookMap.has(key)),
      ...validBooks
        .filter((book) => !manualKeys.includes(book.key))
        .map((book) => book.key),
    ];
    // manual sort (custom): only show the books of the current view
    const scopeKeys = this.getScopeKeys();
    const visibleKeys = scopeKeys
      ? fullOrder.filter((key) => scopeKeys.has(key))
      : fullOrder;
    this.setState({
      fullOrder,
      bookList: visibleKeys.map((key, index) => {
        const book = bookMap.get(key);
        return {
          id: index,
          key: key,
          name: book.name,
          author: book.author || "",
        };
      }),
    });
  };

  handleSortEnd = () => {
    // manual sort (custom): write the new order back into the full order, so
    // that books outside the current view keep their positions
    const currentKeys = (
      this.pendingKeys || this.state.bookList.map((item) => item.key)
    ) as string[];
    this.pendingKeys = null;
    const scopeKeys = new Set(currentKeys);
    let cursor = 0;
    const mergedOrder = this.state.fullOrder.map((key) =>
      scopeKeys.has(key) ? currentKeys[cursor++] : key
    );
    ConfigService.setAllListConfig(mergedOrder, "sortedBookList");
    this.setState({ fullOrder: mergedOrder });
  };

  handleReset = () => {
    ConfigService.setAllListConfig([], "sortedBookList");
    this.loadBookList();
  };

  render() {
    return (
      <div
        className="backup-page-container"
        style={{ height: "480px", top: "calc(50% - 240px)" }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="backup-dialog-title">
          <Trans>Manual order</Trans>
          {/* manual sort (custom): show which shelf is being arranged */}
          {this.props.shelfTitle ? ` · ${this.props.shelfTitle}` : ""}
        </div>
        <div className="import-dialog-option">
          <ReactSortable
            list={this.state.bookList}
            setList={(newState) => {
              // manual sort (custom): remember the drag result for onEnd
              this.pendingKeys = newState.map((item) => item.key);
              this.setState({ bookList: newState });
            }}
            animation={200}
            delayOnTouchStart={true}
            delay={2}
            scroll={true}
            scrollSensitivity={140}
            scrollSpeed={20}
            bubbleScroll={true}
            onEnd={() => {
              this.handleSortEnd();
            }}
          >
            {this.state.bookList.map((item) => {
              return (
                <div className="cloud-drive-item" key={item.key}>
                  <span className="sort-shelf-label">
                    {item.name}
                    {item.author && (
                      <span className="manual-sort-author">
                        {" · " + item.author}
                      </span>
                    )}
                  </span>
                  <span
                    className="icon-menu"
                    style={{ marginRight: "10px" }}
                  ></span>
                </div>
              );
            })}
          </ReactSortable>
          {this.state.bookList.length === 0 && (
            <div style={{ textAlign: "center", opacity: 0.6, marginTop: "30px" }}>
              <Trans>Empty</Trans>
            </div>
          )}
        </div>
        <div
          className="import-dialog-back-button"
          style={{ right: "auto", left: "20px" }}
        >
          <Trans>Drag to sort books</Trans>
        </div>
        <div
          className="import-dialog-back-button"
          style={{ color: "rgb(231, 69, 69)" }}
          onClick={() => {
            this.handleReset();
          }}
        >
          <Trans>Reset manual order</Trans>
        </div>
        <div
          className="backup-page-close-icon"
          onClick={() => {
            this.props.handleClose();
          }}
        >
          <span className="icon-close backup-close-icon"></span>
        </div>
      </div>
    );
  }
}

export default SortBookManualDialog;
