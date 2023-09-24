import React, { useEffect, useState } from "react";
import "./App.css";
import { defaultDrawNumbers } from "./utils/defaultDrawNumber";
import { defaultBoards } from "./utils/defaultBoards";
import axios from "axios";
import ToastMsg from "./components/ToastMsg";

interface ResponseData {
  data?: any;
  msg: string | null;
  extraMsg: string | null;
}

function App(): JSX.Element {
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [boards, setBoards] = useState<number[][][]>(defaultBoards);
  const [indexDrawNumber, setIndexDrawNumber] = useState<number>(0);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [loadingScore, setLoadingScore] = useState<boolean>(true);
  const [loadingNumbers, setLoadingNumbers] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [showSecondModal, setShowSecondModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    checkAndRemoveBoardWins();
  }, [drawNumbers]);

  // Trigger the automatic number picking loop
  useEffect(() => {
    if (loadingNumbers && !gameEnd) {
      new Promise(() => {
        setTimeout(() => {
          pickNextNumber();
        }, 50);
      });
    }
  }, [loadingNumbers, boards]);

  // Close the toast message after a short time
  useEffect(() => {
    setTimeout(() => {
      setShowToast(false);
    }, 10000);
  }, [showToast]);

  // Starts the automatic number picking loop
  function pickAutoAllNumbers() {
    setLoadingNumbers(true);
  }

  // Stops the automatic number picking loop
  function stopPickAutoAllNumbers() {
    setLoadingNumbers(false);
  }

  // Picks the next number in the array of defaultDrawNumbers
  function pickNextNumber() {
    const nextNumber = defaultDrawNumbers[indexDrawNumber];
    setDrawNumbers([...drawNumbers, nextNumber]);
    setIndexDrawNumber(indexDrawNumber + 1);
  }

  function checkDrawNumber(rowNumber: number) {
    if (drawNumbers.includes(rowNumber)) {
      return true;
    } else {
      return false;
    }
  }

  // Check if any of the boards win and remove the winning board
  function checkAndRemoveBoardWins() {
    const updatedBoards = [...boards];
    const isLastBoard = checkIfLastBoard();

    for (let i = 0; i < updatedBoards.length; i++) {
      const board = boards[i];
      if (board.length > 1) {
        if (checkBoardWins(board)) {
          if (!isLastBoard) {
            updatedBoards[i] = []; // Replace the winning board with an empty array to preserve the index number of the remaining boards
          } else {
            setGameEnd(true);
            setLoadingNumbers(false);
            calculateScore();
          }
        }
      }
    }

    setBoards(updatedBoards);
  }

  // Check if it is the last board
  function checkIfLastBoard() {
    const lastBoard = [];

    for (let i = 0; i < boards.length; i++) {
      if (boards[i].length > 1) {
        lastBoard.push(i);
      }
    }

    if (lastBoard.length === 1) {
      return true;
    } else {
      return false;
    }
  }

  // Function to check if a board wins
  function checkBoardWins(board: number[][]) {
    // Check rows
    for (let row = 0; row < board.length; row++) {
      const rowNumbers = board[row];
      if (rowNumbers.every((number) => drawNumbers.includes(number))) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < board[0].length; col++) {
      const colNumbers = board.map((row) => row[col]);
      if (colNumbers.every((number) => drawNumbers.includes(number))) {
        return true;
      }
    }

    return false;
  }

  // Calculate the score of last winning board
  function calculateScore() {
    const lastBoardNumbers = [];

    for (let i = 0; i < boards.length; i++) {
      if (boards[i].length > 1) {
        const board = boards[i];

        for (let j = 0; j < board.length; j++) {
          const row = board[j];

          for (let k = 0; k < row.length; k++) {
            const number = row[k];
            // Check if the number is not in the drawNumbers array
            if (!drawNumbers.includes(number)) {
              lastBoardNumbers.push(number);
            }
          }
        }
      }
    }

    if (lastBoardNumbers.length > 0) {
      // Calculate the total score
      const lastNumber = drawNumbers[drawNumbers.length - 1];
      const totalScore = lastBoardNumbers.reduce((sum, number) => sum + number, 0) * lastNumber;

      setScore(totalScore);

      new Promise(() => {
        setTimeout(() => {
          setLoadingScore(false);
        }, 1500);
      });
    }
  }

  // Restart the game
  function gameRestart() {
    setGameEnd(false);
    setIndexDrawNumber(0);
    setDrawNumbers([]);
    setBoards(defaultBoards);
    setLoadingNumbers(false);
    setResponseData(null);
    setName('');
  }

  // Handle form submission and show the response with toast msg
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setLoadingSubmit(true);
    event.preventDefault();
    axios
      .post(
        "https://customer-api.krea.se/coding-tests/api/squid-game",
        {
          answer: score,
          name: name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setResponseData({ data: response.data, extraMsg: "Hooray!", msg: "You submitted your score successfully." });
        setName("");
        setShowSecondModal(false);
        setLoadingSubmit(false);
      })
      .catch((error) => {
        setResponseData({ extraMsg: "Oops. An error has occured!", msg: error.message });
        setLoadingSubmit(false);
      });

    setShowToast(true);
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="header-fixed-top">
        <h3 className="text-light pb-3">Giant Squid</h3>
        <div className="d-flex justify-content-evenly mb-4">
          <button disabled={loadingNumbers} onClick={pickNextNumber} className="btn btn-success" style={{ minWidth: 100 }}>
            {loadingNumbers ? <span className="spinner-border spinner-small"></span> : <span>Pick next number</span>}
          </button>
          <div>
            <button disabled={loadingNumbers} onClick={pickAutoAllNumbers} className="btn btn-warning me-4" style={{ minWidth: 100 }}>
              {loadingNumbers ? <span className="spinner-border spinner-small"></span> : <span>Pick automatic all numbers</span>}
            </button>
            {loadingNumbers && (
              <button onClick={stopPickAutoAllNumbers} className="btn btn-secondary" style={{ minWidth: 100 }}>
                Stop
              </button>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-light">Drawed numbers:</h5>
          <div className="d-flex flex-wrap container">
            {drawNumbers.map((number, index) => (
              <span key={index} className="text-light pe-1">
                {number},
              </span>
            ))}
          </div>
        </div>
      </header>
      {/* Boards */}
      <div className="d-flex flex-wrap justify-content-center">
        {boards.map(
          (board, index) =>
            board.length > 1 && (
              <div key={index} className="m-3">
                <span className="text-light">Board: {index + 1}</span>
                <div style={{ width: 150, height: 150 }} className="bg-secondary p-1 rounded-2 d-flex flex-column justify-content-between">
                  {board.map((boardRow, index) => (
                    <div key={index} className="d-flex justify-content-between">
                      {boardRow.map((boardRowNumber) => (
                        <span key={boardRowNumber} className={checkDrawNumber(boardRowNumber) ? "text-danger fw-bold" : "text-light"}>
                          {boardRowNumber}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
      {/* Win Modal */}
      <div className="modal custom-modal-backdrop" tabIndex={-1} role="dialog" style={{ display: gameEnd ? "block" : "none" }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header justify-content-center">
              <h4 className="modal-title">Game Ended!</h4>
            </div>
            <div className="modal-body">
              {loadingScore ? (
                <div>
                  <p>Calculating score... </p>
                  <span className="spinner-border"></span>
                </div>
              ) : (
                <h5 className="my-2">
                  Greg lost from the giant squid. The score of the last board is: <strong>{score}</strong>
                </h5>
              )}
            </div>
            <div className="modal-footer flex-column d-flex justify-content-center">
              {responseData?.data ? (
                null
              ) : (
                <button
                  disabled={loadingScore}
                  type="button"
                  className="btn btn-success w-50 my-3"
                  style={{ minWidth: 100 }}
                  onClick={() => setShowSecondModal(true)}
                >
                  Submit You Score!
                </button>
              )}
              <button disabled={loadingScore} type="button" className="btn btn-primary w-50" style={{ minWidth: 100 }} onClick={() => gameRestart()}>
                Play Again!
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Submit Form Modal */}
      <div className="modal custom-modal-backdrop" tabIndex={-1} role="dialog" style={{ display: showSecondModal ? "block" : "none" }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header justify-content-center">
              <h4 className="modal-title">Submit Your Score</h4>
            </div>
            <div className="modal-body">
              {/* Form with input fields for "answer" and "name" */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="answer" className="form-label">
                    Answer (score):
                  </label>
                  <input type="text" className="form-control" id="answer" value={score} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input type="text" className="form-control" id="name" minLength={3} value={name} onChange={(event) => setName(event.target.value)} />
                  {name.length < 3 && (
                    <span className="text-danger" style={{ fontSize: 13 }}>
                      Min. 3 characters. {name.length}/3
                    </span>
                  )}
                </div>
                <button disabled={loadingSubmit || name.length < 3} type="submit" className="btn btn-success w-50" style={{ minWidth: 100 }}>
                  {loadingSubmit ? <span className="spinner-border spinner-small"></span> : <span>Submit</span>}
                </button>
              </form>
            </div>
            <div className="modal-footer justify-content-center">
              <button type="button" className="btn btn-secondary" style={{ minWidth: 100 }} onClick={() => setShowSecondModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Display the toast if showToast is true */}
      {showToast && responseData && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          <ToastMsg message={responseData?.msg} extraMessage={responseData?.extraMsg} onClose={() => setShowToast(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
