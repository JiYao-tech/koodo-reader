import React from "react";
import { createPortal } from "react-dom"; // manual sort (custom)
import "./sortDialog.css";
import { Trans } from "react-i18next";
import { SortDialogProps, SortDialogState } from "./interface";
import { ConfigService } from "../../../assets/lib/kookit-extra-browser.min";
import SortBookManualDialog from "../sortBookManualDialog"; // manual sort (custom)

class SortDialog extends React.Component<SortDialogProps, SortDialogState> {
  constructor(props: SortDialogProps) {
    super(props);
    this.state = {
      isNote: this.props.mode === "note" || this.props.mode === "highlight",
      isManualDialogOpen: false, // manual sort (custom)
    };
  }

  handleSort = (code: number) => {
    if (this.state.isNote) {
      let noteSortCode = this.props.noteSortCode;
      noteSortCode.sort = code;
      this.props.handleNoteSortCode(noteSortCode);
      ConfigService.setReaderConfig(
        "noteSortCode",
        JSON.stringify({ sort: code, order: this.props.noteSortCode.order })
      );
      this.props.handleFetchNotes();
    } else {
      let bookSortCode = this.props.bookSortCode;
      bookSortCode.sort = code;
      this.props.handleBookSortCode(bookSortCode);
      ConfigService.setReaderConfig(
        "bookSortCode",
        JSON.stringify({ sort: code, order: this.props.bookSortCode.order })
      );
      this.props.handleFetchBooks();
      if (code === 8) {
        // manual sort (custom): open the drag dialog for arranging books
        this.setState({ isManualDialogOpen: true });
      }
    }
  };
  handleOrder = (code: number) => {
    if (this.state.isNote) {
      let noteSortCode = this.props.noteSortCode;
      noteSortCode.order = code;
      ConfigService.setReaderConfig(
        "noteSortCode",
        JSON.stringify({ sort: this.props.noteSortCode.sort, order: code })
      );
      this.props.handleNoteSortCode(noteSortCode);
      this.props.handleFetchNotes();
    } else {
      let bookSortCode = this.props.bookSortCode;
      bookSortCode.order = code;
      ConfigService.setReaderConfig(
        "bookSortCode",
        JSON.stringify({ sort: this.props.bookSortCode.sort, order: code })
      );
      this.props.handleBookSortCode(bookSortCode);
      this.props.handleFetchBooks();
    }
  };

  render() {
    let sortCode = this.state.isNote
      ? this.props.noteSortCode
      : this.props.bookSortCode;
    return (
      <div
        className="sort-dialog-container"
      onMouseLeave={() => {
        // manual sort (custom): keep popup open while the drag dialog is on
        if (!this.state.isManualDialogOpen) {
          this.props.handleSortDisplay(false);
        }
      }}
        onMouseEnter={() => {
          this.props.handleSortDisplay(true);
        }}
        style={this.state.isNote ? { height: "132px" } : {}}
      >
        {this.state.isNote ? (
          <ul className="sort-by-category">
            {["Sort by Date", "Reading progress"].map((item, index) => {
              return (
                <li
                  className="sort-by-category-list"
                  onClick={() => {
                    this.handleSort(index + 1);
                  }}
                  style={sortCode.sort === index + 1 ? {} : { opacity: 0.34 }}
                  key={index + 1}
                >
                  <Trans>{item}</Trans>
                  {sortCode.sort === index + 1 && (
                    <span
                      className="icon-check"
                      style={{ fontWeight: "bold" }}
                    ></span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="sort-by-category">
            {[
              "Recently read",
              "Book name",
              "Sort by Date",
              "Reading duration",
              "Author name",
              "Reading progress",
              "File size",
              "Manual order", // manual sort (custom)
            ].map((item, index) => {
              return (
                <li
                  className="sort-by-category-list"
                  onClick={() => {
                    this.handleSort(index + 1);
                  }}
                  style={sortCode.sort === index + 1 ? {} : { opacity: 0.34 }}
                  key={index + 1}
                >
                  <Trans>{item}</Trans>
                  {sortCode.sort === index + 1 && (
                    <span
                      className="icon-check"
                      style={{ fontWeight: "bold" }}
                    ></span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="sort-dialog-seperator"></div>
        <ul className="sort-by-order">
          <li
            className="sort-by-order-list"
            onClick={() => {
              this.handleOrder(1);
            }}
            style={sortCode.order === 1 ? {} : { opacity: 0.34 }}
          >
            <Trans>Ascend</Trans>
            {sortCode.order === 1 && (
              <span
                className="icon-check"
                style={{ fontWeight: "bold" }}
              ></span>
            )}
          </li>
          <li
            className="sort-by-order-list"
            onClick={() => {
              this.handleOrder(2);
            }}
            style={sortCode.order === 2 ? {} : { opacity: 0.34 }}
          >
            <Trans>Descend</Trans>
            {sortCode.order === 2 && (
              <span
                className="icon-check"
                style={{ fontWeight: "bold" }}
              ></span>
            )}
          </li>
        </ul>
        {/* manual sort (custom): render the drag dialog via portal so that
            it is positioned against the viewport instead of this popup */}
        {this.state.isManualDialogOpen &&
          createPortal(
            <SortBookManualDialog
              mode={this.props.mode}
              shelfTitle={this.props.shelfTitle}
              handleClose={() => {
                this.setState({ isManualDialogOpen: false });
                // manual sort (custom): refresh the list with the new order
                this.props.handleFetchBooks();
              }}
            />,
            document.body
          )}
      </div>
    );
  }
}

export default SortDialog;
