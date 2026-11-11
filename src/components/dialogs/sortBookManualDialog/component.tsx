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
  constructor(props: SortBookManualDialogProps) {
    super(props);
    this.state = {
      bookList: [],
    };
  }

  componentDidMount = async () => {
    await this.loadBookList();
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
    const orderedBooks = [
      ...manualKeys
        .filter((key: string) => bookMap.has(key))
        .map((key: string) => bookMap.get(key)),
      ...validBooks.filter((book) => !manualKeys.includes(book.key)),
    ];
    this.setState({
      bookList: orderedBooks.map((book, index) => ({
        id: index,
        key: book.key,
        name: book.name,
        author: book.author || "",
      })),
    });
  };

  handleSortEnd = () => {
    ConfigService.setAllListConfig(
      this.state.bookList.map((item) => item.key),
      "sortedBookList"
    );
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
        </div>
        <div className="import-dialog-option">
          <ReactSortable
            list={this.state.bookList}
            setList={(newState) => this.setState({ bookList: newState })}
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
