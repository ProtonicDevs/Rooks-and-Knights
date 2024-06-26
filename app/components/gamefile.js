"use client";
import React, { useState } from "react";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import { useSocket } from "./socket";
import Image from "next/image";
import Loading from "./loading";

const Gamefile = () => {
  const handleOppoMove = (move) => {
    if (chess.move(move)) {
      setFen(chess.fen());
    } else {
      console.log("Invalid Move");
    }
    checkGameStatus(chess, color, turn);
  };
  const {
    opponentId,
    opponentName,
    userName,
    board,
    color,
    matchQueued,
    matchFound,
    turn,
    socket,
    userMsg,
    opponentMsg,
    setTurn,
    setUserMove,
    sendMsg,
    setUserMsg,
    setUserName,
    findMatch,
    sendMove,
  } = useSocket(handleOppoMove);

  const [chess] = useState(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  );
  const [fen, setFen] = useState(chess.fen());

  const checkGameStatus = (chess, color) => {
    // check all game end conditions
    if (chess.isCheckmate()) {
      alert("Checkmate");
      if (turn) {
        alert("You Win");
      } else {
        alert("You Loose");
      }
    } else if (chess.isDraw()) {
      alert("Stalemate");
    } else if (chess.inCheck()) {
      alert("Check");
    }
  };

  const handleMove = (move, socket) => {
    try {
      const result = chess.move(move);
      if (result === null) {
        throw new Error("Invalid Move");
      } else {
        setFen(chess.fen());
      }
      console.log("move handled");
      setUserMove(move);
      setTurn(false);
      sendMove(move, socket);
      checkGameStatus(chess, color);
    } catch (error) {
      alert("Invalid Move");
    }
  };

  // const RandomMove = () => {
  //   const moves = chess.moves();
  //   if (moves.length > 0) {
  //     const computerMove = moves[Math.floor(Math.random() * moves.length)];
  //     console.log("computer move : ", computerMove);
  //     chess.move(computerMove);
  //     setFen(chess.fen());
  //   }
  // };
  // const Chessboard = React.lazy(() => import("chessboardjsx"));
  return (
    <div className="flex-center bg-gray-900 ">
      {opponentName && (
        <div>
          <div className="font-mono text-xl p-5 text-white">
            You are playing against : {opponentName}
          </div>
          <div
            className={`${
              turn ? "bg-green-500 text-white" : "bg-red-500 text-white "
            }`}
          >
            turn
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-evenly">
        <div>
          {board && (
            <Chessboard
              width={400}
              position={fen}
              onDrop={(move) =>
                handleMove({
                  from: move.sourceSquare,
                  to: move.targetSquare,
                  promotion: "q",
                })
              }
              orientation={color}
              dropOffBoard={"snapback"}
              draggable={turn}
            />
          )}
        </div>
        <div className="bg-gray-800">
          {opponentMsg}
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <input
          type="text"
          placeholder={`${
            !matchQueued ? "Enter Your Name" : "Enter Your Message"
          }`}
          className="w-full p-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          value={`${!matchQueued ? userName : userMsg}`}
          onChange={(e) =>
            !matchQueued
              ? setUserName(e.target.value)
              : setUserMsg(e.target.value)
          }
        />
        <button
          className={`ml-2 px-4 py-2 rounded-md focus:outline-none ${
            color
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600"
          }`}
          onClick={
            color
              ? () => {
                  sendMsg(userMsg);
                }
              : () => {
                  findMatch(socket);
                }
          }
        >
          {color ? "Send" : "Find Match"}
        </button>
      </div>
      {matchQueued && !matchFound && (
        <div className="w-full flex flex-col items-center">
          <Loading />
          <div className="text-white p-3">Searchig opponent for {userName}</div>
        </div>
      )}
    </div>
  );
};
export default Gamefile;
